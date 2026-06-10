import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const userId = session.metadata.user_id;
    const subscriptionId = session.subscription;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    await supabase.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: session.customer,
      stripe_subscription_id: subscriptionId,
      plan: "pro",
      status: "active",
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
    });

    await supabase
      .from("profiles")
      .update({ plan: "pro" })
      .eq("id", userId);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as any;
    await supabase
      .from("subscriptions")
      .update({ status: "cancelled", plan: "free" })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}
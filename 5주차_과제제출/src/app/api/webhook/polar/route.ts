import { Webhooks } from "@polar-sh/nextjs";
import { prisma } from "@/lib/prisma";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onOrderPaid: async (payload) => {
    const order = payload.data;

    // 중복 방지: 이미 저장된 주문인지 확인
    const existing = await prisma.payment.findUnique({
      where: { polarOrderId: order.id },
    });
    if (existing) return;

    // DB에 결제 기록 저장
    await prisma.payment.create({
      data: {
        userId: order.customer.externalId ?? order.customerId,
        polarOrderId: order.id,
        polarProductId: order.productId ?? undefined,
        amount: order.totalAmount,
        currency: order.currency,
        status: "succeeded",
        productName: order.product?.name ?? "상품",
        customerEmail: order.customer.email,
      },
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Polar Webhook] Order paid: ${order.id}`);
    }
  },
  onCheckoutUpdated: async (payload) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[Polar Webhook] Checkout updated: ${payload.data.id}, status: ${payload.data.status}`
      );
    }
  },
});

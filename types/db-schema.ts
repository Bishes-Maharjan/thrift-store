import { Prisma } from "@prisma/client";

export type OrderWithDetails = Prisma.OrderGetPayload<{
    include: { items: true; address: true; payment: true };
}>;
import { prisma } from '@/lib/db'
import Link from 'next/link'
import type { OrderAdminListItem } from '@/types/db-schema'

export default async function AdminOrdersPage() {
  const orders: OrderAdminListItem[] = await prisma.order.findMany({
    include: {
      user: true,
      payment: true,
      _count: { select: { items: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#1d1d1f]">Orders</h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-[#d2d2d7]">
        <table className="min-w-full divide-y divide-[#d2d2d7]">
          <thead className="bg-[#f5f5f7]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Amount / Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Payment Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Order Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#d2d2d7]">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#86868b]">
                  {order.id.slice(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#1d1d1f]">{order.user.name}</div>
                  <div className="text-sm text-[#86868b]">{order.user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#86868b]">
                  ${order.totalAmount.toFixed(2)} / {order._count.items} items
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.payment?.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                    order.payment?.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment?.status || 'PENDING'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/orders/${order.id}`} className="text-[#0071e3] hover:text-[#0077ed] font-bold">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { prisma } from '@/lib/db'
import Link from 'next/link'
import type { UserAdminListItem } from '@/types/db-schema'

export default async function AdminUsersPage() {
  const users: UserAdminListItem[] = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { orders: true },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#1d1d1f]">Users</h1>
        <Link
          href="/admin/users/new"
          className="bg-black text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors rounded-full"
        >
          Add User
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-[#d2d2d7]">
        {users.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-bold tracking-widest uppercase text-[#86868b]">
              No users found
            </p>
            <Link
              href="/admin/users/new"
              className="inline-block mt-6 bg-black text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors rounded-full"
            >
              Create First User
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-[#d2d2d7]">
            <thead className="bg-[#f5f5f7]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#86868b] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#d2d2d7]">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#1d1d1f]">{user.name || 'No name'}</div>
                    <div className="text-sm text-[#86868b]">{user.email}</div>
                    {user.phone && (
                      <div className="text-xs text-[#86868b] mt-1">{user.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#86868b]">
                    {user._count.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#86868b]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-[#0071e3] hover:text-[#0077ed] font-bold"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

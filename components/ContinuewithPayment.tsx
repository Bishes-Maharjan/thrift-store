'use client'

import { useState } from 'react'

export default function ContinuePaymentButton({ orderId }: { orderId: string }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/khalti/initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            })

            const data = await res.json()

            if (res.ok && data.redirectUrl) {
                window.location.href = data.redirectUrl
            } else {
                setError(data.error || 'Could not initiate payment')
            }
        } catch (e) {
            console.error(e)
            setError('Error connecting to Khalti')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#0071e3] text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-[#0077ed] transition-colors rounded-full disabled:opacity-50"
            >
                {loading ? 'Redirecting...' : 'Continue with Payment'}
            </button>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
        </div>
    )
}
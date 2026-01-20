'use client'

import { SignedIn } from '@clerk/nextjs'
import { SubscriptionDetailsButton } from '@clerk/nextjs/experimental'

export default function BillingPage() {
  return (
    <SignedIn>
      {/* Basic usage */}
      <SubscriptionDetailsButton />

      {/* Customizes the appearance of the subscription details drawer */}
      <SubscriptionDetailsButton
        subscriptionDetailsProps={{
          appearance: {
            /* custom theme */
          },
        }}
      />

      {/* Custom button */}
      <SubscriptionDetailsButton onSubscriptionCancel={() => console.log('Subscription canceled')}>
        <button className="custom-button">
          
          Manage Subscription
        </button>
      </SubscriptionDetailsButton>
    </SignedIn>
  )
}
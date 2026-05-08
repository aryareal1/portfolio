<script lang="ts">
  import { api } from "@/lib/api";
  import { getAvatarColor } from "@/lib/utils";
  import { Users, MessageSquare } from "@lucide/svelte";

  let guests = $state<any[]>([]);
  let isLoading = $state(true);

  async function fetchGuests() {
    try {
      const { data, error } = await api.traktiran.get();
      if (!error && data) {
        guests = data;
      }
    } catch (err) {
      console.error(err);
    } finally {
      isLoading = false;
    }
  }


  $effect(() => {
    fetchGuests();

    // Refresh on custom event
    const handleUpdate = () => fetchGuests();
    window.addEventListener("traktiran-updated", handleUpdate);

    // Refresh on tab focus
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchGuests();
    };
    window.addEventListener("visibilitychange", handleVisibility);

    // Refresh every 5 seconds
    const interval = setInterval(fetchGuests, 5000);

    return () => {
      window.removeEventListener("traktiran-updated", handleUpdate);
      window.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  });
</script>


<section class="list-section">
  <div class="list-container">
    <div class="list-header">
      <div class="icon-wrapper">
        <Users size={32} class="list-icon" />
      </div>
      <h2 class="list-title">The Guest List</h2>
      <p id="guest-count">
        {#if isLoading}
          Loading guests...
        {:else}
          {guests.length} guests attending
        {/if}
      </p>
    </div>

    <div class="guest-list">
      {#if isLoading && guests.length === 0}
        <div class="skeleton-row"></div>
        <div class="skeleton-row"></div>
        <div class="skeleton-row"></div>
      {:else if guests.length === 0}
        <div class="empty-state">
          <p>No RSVPs yet. Be the first!</p>
        </div>
      {:else}
        {#each guests as guest, i}
          <div class="guest-row">
            <div class="row-number">
              <span>#{guests.length - i}</span>
            </div>
            <div class="row-content" class:no-message={!guest.message}>
              <div
                class="avatar"
                style="background: {getAvatarColor(guest.name)}"
              >
                {guest.name.charAt(0).toUpperCase()}
              </div>
              <div class="guest-details">
                <span class="guest-name">{guest.name}</span>
                {#if guest.message}
                  <div class="message-wrapper">
                    <MessageSquare size={14} />
                    <p class="guest-message">{guest.message}</p>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</section>

<style>
  .list-section {
    padding: 0;
  }

  .list-container {
    width: 100%;
  }

  .list-header {
    text-align: left;
    margin-bottom: 2rem;
  }

  .icon-wrapper {
    display: inline-flex;
    padding: 1rem;
    background: rgba(99, 102, 241, 0.1);
    color: #4f46e5;
    border-radius: 1rem;
  }

  .list-title {
    font-size: 2rem;
    font-weight: 800;
    margin-top: 1rem;
    margin-bottom: 0.25rem;
    color: #111827;
  }

  #guest-count {
    color: #6b7280;
    font-weight: 500;
    margin-top: 0;
  }

  .guest-list {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 1.5rem;
    overflow: hidden;
    border: 1px solid #f3f4f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .guest-row {
    display: flex;
    border-bottom: 1px solid #f3f4f6;
    animation: fadeIn 0.5s ease forwards;
  }

  .guest-row:last-child {
    border-bottom: none;
  }

  .row-number {
    width: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 2px solid #f3f4f6;
    font-weight: 800;
    color: #9ca3af;
    background: #fcfcfc;
    flex-shrink: 0;
  }

  .row-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem 2rem;
    flex: 1;
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .guest-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .guest-name {
    font-weight: 800;
    color: #111827;
    font-size: 1.125rem;
  }

  .message-wrapper {
    display: flex;
    align-items: start;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  .message-wrapper :global(svg) {
    color: #757a82;
    flex-shrink: 0;
    margin-top: 5px;
  }

  .guest-message {
    margin: 0;
    line-height: 1.6;
    color: #4b5563;
    font-size: 0.9375rem;
  }

  /* Skeleton */
  .skeleton-row {
    height: 100px;
    background: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
    position: relative;
    overflow: hidden;
  }

  .skeleton-row::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.5),
      transparent
    );
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .empty-state {
    padding: 4rem;
    text-align: center;
    color: #9ca3af;
    font-style: italic;
  }

  @media (max-width: 1024px) {
    .list-header {
      text-align: center;
    }
  }

  @media (max-width: 640px) {
    .row-number {
      width: 60px;
      font-size: 0.875rem;
    }
    .row-content {
      padding: 1.25rem;
      gap: 1rem;
    }
    .avatar {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }
  }
</style>

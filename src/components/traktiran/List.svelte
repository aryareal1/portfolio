<script lang="ts">
  import { api } from "@/lib/api";
  import { getAvatarColor } from "@/lib/utils";
  import { Users, MessageSquare, Reply, Send } from "@lucide/svelte";

  let guests = $state<any[]>([]);
  let isLoading = $state(true);

  // Admin states
  let adminKey = $state(
    typeof window !== "undefined" ? localStorage.getItem("x-key") : "",
  );
  let activeReplyId = $state<string | null>(null);
  let replyText = $state("");
  let isSubmittingReply = $state(false);

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

  async function submitReply(uId: string) {
    if (!replyText.trim() || !adminKey) return;
    isSubmittingReply = true;
    try {
      const { data, error } = await api.traktiran.reply.post(
        { uId, message: replyText },
        { headers: { "x-api-key": adminKey } },
      );
      if (!error) {
        replyText = "";
        activeReplyId = null;
        fetchGuests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      isSubmittingReply = false;
    }
  }

  $effect(() => {
    fetchGuests();

    const handleUpdate = () => fetchGuests();
    window.addEventListener("traktiran-updated", handleUpdate);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchGuests();
    };
    window.addEventListener("visibilitychange", handleVisibility);

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

                <!-- Replies -->
                {#if guest.replies && guest.replies.length > 0}
                  <div class="replies-list">
                    {#each guest.replies as reply}
                      <div class="reply-item">
                        <span class="reply-badge">Admin</span>
                        <span class="reply-message">{reply.message.trim()}</span
                        >
                      </div>
                    {/each}
                  </div>
                {/if}

                <!-- Admin Action -->
                {#if adminKey}
                  <div class="admin-actions">
                    {#if activeReplyId === guest.uId}
                      <div class="reply-form">
                        <input
                          type="text"
                          bind:value={replyText}
                          placeholder="Type your reply..."
                          disabled={isSubmittingReply}
                          onkeydown={(e) =>
                            e.key === "Enter" && submitReply(guest.uId)}
                        />
                        <button
                          class="send-btn"
                          onclick={() => submitReply(guest.uId)}
                          disabled={isSubmittingReply || !replyText.trim()}
                        >
                          <Send size={14} />
                        </button>
                        <button
                          class="cancel-btn"
                          onclick={() => (activeReplyId = null)}
                          disabled={isSubmittingReply}
                        >
                          Cancel
                        </button>
                      </div>
                    {:else}
                      <button
                        class="reply-btn"
                        onclick={() => {
                          activeReplyId = guest.uId;
                          replyText = "";
                        }}
                      >
                        <Reply size={14} /> Reply
                      </button>
                    {/if}
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
    width: 100%;
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

  .replies-list {
    margin-top: 0.5rem;
    padding-left: 1.25rem;
    border-left: 2px solid #eef2ff;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .reply-item {
    background: #f8fafc;
    padding: 0.5rem 0.75rem;
    border-radius: 0.75rem;
    border: 1px solid #f1f5f9;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .reply-badge {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    background: #eef2ff;
    color: #4f46e5;
    font-size: 0.65rem;
    font-weight: 800;
    border-radius: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    flex-shrink: 0;
  }

  .reply-message {
    color: #334155;
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  .admin-actions {
    margin-top: 1rem;
  }

  .reply-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reply-btn:hover {
    background: #f8fafc;
    color: #4f46e5;
    border-color: #cbd5e1;
  }

  .reply-form {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #f8fafc;
    padding: 0.5rem;
    padding-left: 1rem;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    animation: slideIn 0.3s ease;
  }

  .reply-form input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 0.5rem 0;
    font-size: 0.9375rem;
    color: #1e293b;
  }

  .send-btn {
    background: #4f46e5;
    color: white;
    border: none;
    padding: 0.5rem;
    border-radius: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .send-btn:hover:not(:disabled) {
    background: #4338ca;
  }

  .send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cancel-btn {
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.5rem;
    cursor: pointer;
  }

  .cancel-btn:hover {
    color: #ef4444;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

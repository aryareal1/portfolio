<script lang="ts">
  import { api } from '@/lib/api';
  import { Users, MessageSquare } from '@lucide/svelte';

  let guests = $state<any[]>([]);
  let isLoading = $state(true);

  async function fetchGuests() {
    isLoading = true;
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
    
    const handler = () => fetchGuests();
    window.addEventListener('traktiran-updated', handler);
    return () => window.removeEventListener('traktiran-updated', handler);
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
    
    <div class="guest-grid">
      {#if isLoading && guests.length === 0}
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      {:else if guests.length === 0}
        <div class="empty-state">
          <p>No RSVPs yet. Be the first!</p>
        </div>
      {:else}
        {#each guests as guest}
          <div class="guest-card">
            <div class="guest-info">
              <div class="avatar">{guest.name.charAt(0).toUpperCase()}</div>
              <span class="guest-name">{guest.name}</span>
            </div>
            <div class="message-wrapper">
              <MessageSquare size={16} class="message-icon" />
              <p class="guest-message">"{guest.message}"</p>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</section>




<style>
  .list-section {
    padding: 4rem 1rem;
    background: #fdfdfd;
  }

  .list-container {
    max-width: 1000px;
    margin: 0 auto;
  }

  .list-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .icon-wrapper {
    display: inline-flex;
    padding: 1rem;
    background: rgba(99, 102, 241, 0.1);
    color: #4f46e5;
    border-radius: 1rem;
    margin-bottom: 1rem;
  }

  .list-title {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: #111827;
  }

  #guest-count {
    color: #6b7280;
    font-weight: 500;
  }

  .guest-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .guest-card {
    background: white;
    padding: 1.5rem;
    border-radius: 1rem;
    border: 1px solid #f3f4f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
    /* In Svelte, we can use transitions but I'll stick to CSS animation for consistency */
    animation: fadeIn 0.5s ease forwards;
  }

  .guest-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .guest-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1.125rem;
  }

  .guest-name {
    font-weight: 700;
    color: #111827;
  }

  .message-wrapper {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    color: #4b5563;
  }

  .message-icon {
    margin-top: 0.25rem;
    flex-shrink: 0;
    opacity: 0.5;
  }

  .guest-message {
    margin: 0;
    line-height: 1.6;
    font-style: italic;
    font-size: 0.9375rem;
  }

  /* Skeleton */
  .skeleton-card {
    height: 140px;
    background: #f3f4f6;
    border-radius: 1rem;
    position: relative;
    overflow: hidden;
  }

  .skeleton-card::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 4rem;
    color: #9ca3af;
    background: white;
    border-radius: 1rem;
    border: 2px dashed #e5e7eb;
  }
</style>

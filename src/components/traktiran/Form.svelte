<script lang="ts">
  import { api } from '@/lib/api';
  import { Send, Check, AlertCircle } from '@lucide/svelte';
  
  let name = $state('');
  let kataKata = $state('');
  let status = $state<'idle' | 'sending' | 'success' | 'error'>('idle');

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    status = 'sending';
    
    try {
      const { data, error } = await api.traktiran.post({ 
        name, 
        "kata-kata": kataKata 
      });
      
      if (!error) {
        status = 'success';
        name = '';
        kataKata = '';
        window.dispatchEvent(new CustomEvent('traktiran-updated'));
        setTimeout(() => {
          status = 'idle';
        }, 3000);
      } else {
        throw new Error('Failed to submit');
      }
    } catch (err) {
      status = 'error';
      setTimeout(() => {
        status = 'idle';
      }, 3000);
    }
  }
</script>

<section class="form-section">
  <div class="form-card">
    <h2 class="form-title">Are you coming?</h2>
    <p class="form-desc">Let us know if you'll be joining the party!</p>
    
    <form onsubmit={handleSubmit} class="form">
      <div class="input-group">
        <label for="name">Your Name</label>
        <input 
          type="text" 
          id="name" 
          bind:value={name} 
          placeholder="Enter your full name" 
          required 
          disabled={status === 'sending'}
        />
      </div>
      
      <div class="input-group">
        <label for="kata-kata">Your Message</label>
        <textarea 
          id="kata-kata" 
          bind:value={kataKata} 
          rows="4" 
          placeholder="Say something nice..." 
          required 
          disabled={status === 'sending'}
        ></textarea>
      </div>
      
      <button type="submit" class="submit-btn" class:success={status === 'success'} class:error={status === 'error'} disabled={status === 'sending'}>
        {#if status === 'sending'}
          <span>Sending...</span>
        {:else if status === 'success'}
          <Check size={20} />
          <span>Success!</span>
        {:else if status === 'error'}
          <AlertCircle size={20} />
          <span>Error! Try again</span>
        {:else}
          <span>Send RSVP</span>
          <Send size={20} />
        {/if}
      </button>
    </form>
  </div>
</section>


<style>
  .form-section {
    padding: 2rem 1rem;
    display: flex;
    justify-content: center;
  }

  .form-card {
    background: white;
    padding: 2.5rem;
    border-radius: 1.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    width: 100%;
    max-width: 500px;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .form-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: #111827;
  }

  .form-desc {
    color: #6b7280;
    font-size: 0.9375rem;
    margin-bottom: 2rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-group label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  input, textarea {
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    border: 1px solid #e5e7eb;
    font-family: inherit;
    font-size: 1rem;
    transition: all 0.2s ease;
    background: #f9fafb;
    resize: vertical;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: #6366f1;
    background: white;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  .submit-btn {
    margin-top: 0.5rem;
    background: #111827;
    color: white;
    padding: 0.875rem;
    border-radius: 0.75rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: all 0.2s ease;
  }

  .submit-btn:hover:not(:disabled) {
    background: #1f2937;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-btn.success {
    background: #10b981;
  }

  .submit-btn.error {
    background: #ef4444;
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .submit-btn svg {
    transition: transform 0.2s ease;
  }

  .submit-btn:hover:not(:disabled) svg {
    transform: translateX(2px) translateY(-2px);
  }
</style>

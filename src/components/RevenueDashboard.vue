<template>
  <div class="revenue-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h2 class="dashboard-title">
        <span class="icon">💰</span>
        Deine Einnahmen
      </h2>
      <p class="dashboard-subtitle">
        Du verdienst, weil deine Interessen bessere Ads ermöglichen
      </p>
    </div>

    <!-- Revenue Summary Cards -->
    <div class="revenue-cards">
      <!-- Weekly Revenue -->
      <div class="revenue-card highlight">
        <div class="card-icon">📅</div>
        <div class="card-content">
          <div class="card-label">Diese Woche</div>
          <div class="card-value">{{ formatCurrency(revenue.weeklyRevenue) }}</div>
        </div>
      </div>

      <!-- Monthly Revenue -->
      <div class="revenue-card">
        <div class="card-icon">📊</div>
        <div class="card-content">
          <div class="card-label">Diesen Monat</div>
          <div class="card-value">{{ formatCurrency(revenue.monthlyRevenue) }}</div>
        </div>
      </div>

      <!-- Total Revenue -->
      <div class="revenue-card">
        <div class="card-icon">💎</div>
        <div class="card-content">
          <div class="card-label">Gesamt</div>
          <div class="card-value primary">{{ formatCurrency(revenue.totalRevenue) }}</div>
        </div>
      </div>
    </div>

    <!-- Withdrawal Section -->
    <div class="withdrawal-section">
      <div class="withdrawal-info">
        <h3>Auszahlung</h3>
        <p v-if="revenue.canWithdraw" class="available">
          ✅ Verfügbar ab 10€ - Du kannst jetzt auszahlen!
        </p>
        <p v-else class="not-available">
          ⏳ Noch {{ formatCurrency(10 - revenue.totalRevenue) }} bis zur Auszahlung
        </p>
      </div>

      <button
        v-if="revenue.canWithdraw"
        @click="showWithdrawalModal = true"
        class="btn-withdraw"
      >
        <span>💸</span>
        Jetzt auszahlen
      </button>
    </div>

    <!-- Top Interests by Revenue -->
    <div class="interests-section">
      <h3 class="section-title">
        <span class="icon">🎯</span>
        Top Interessen (Revenue)
      </h3>

      <div v-if="revenue.revenueByInterest.length > 0" class="interests-list">
        <div
          v-for="item in revenue.revenueByInterest.slice(0, 5)"
          :key="item.interest"
          class="interest-item"
        >
          <div class="interest-name">{{ item.interest }}</div>
          <div class="interest-stats">
            <div class="interest-bar">
              <div
                class="interest-fill"
                :style="{ width: item.percentage + '%' }"
              ></div>
            </div>
            <div class="interest-value">
              <span class="percentage">{{ item.percentage.toFixed(0) }}%</span>
              <span class="amount">{{ formatCurrency(item.revenue) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>Noch keine Einnahmen. Klicke auf Artikel um Ads zu sehen!</p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-label">Impressions</div>
        <div class="stat-value">{{ revenue.impressionCount }}</div>
      </div>

      <div class="stat-item">
        <div class="stat-label">Clicks</div>
        <div class="stat-value">{{ revenue.clickCount }}</div>
      </div>

      <div class="stat-item">
        <div class="stat-label">CTR</div>
        <div class="stat-value">{{ revenue.clickThroughRate.toFixed(1) }}%</div>
      </div>

      <div class="stat-item">
        <div class="stat-label">Ø Revenue/Click</div>
        <div class="stat-value">
          {{ formatCurrency(revenue.clickCount > 0 ? revenue.totalRevenue / revenue.clickCount : 0) }}
        </div>
      </div>
    </div>

    <!-- How It Works -->
    <div class="info-section">
      <h3 class="section-title">
        <span class="icon">💡</span>
        Wie funktioniert das?
      </h3>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-number">1</div>
          <div class="info-content">
            <h4>Du liest Artikel</h4>
            <p>Basierend auf deinen Interessen (Tech, Urban, etc.)</p>
          </div>
        </div>

        <div class="info-item">
          <div class="info-number">2</div>
          <div class="info-content">
            <h4>Ads werden gezeigt</h4>
            <p>Die zu deinen Interessen passen (bessere Relevanz)</p>
          </div>
        </div>

        <div class="info-item">
          <div class="info-number">3</div>
          <div class="info-content">
            <h4>Du verdienst 30%</h4>
            <p>Weil deine Daten helfen bessere Ads zu zeigen</p>
          </div>
        </div>

        <div class="info-item">
          <div class="info-number">4</div>
          <div class="info-content">
            <h4>Channel bekommt 20%</h4>
            <p>Finanziert Meetups & Events</p>
          </div>
        </div>
      </div>

      <div class="info-breakdown">
        <h4>Revenue Breakdown (100%):</h4>
        <ul>
          <li><strong>40%</strong> → Plattform (Server, Entwicklung)</li>
          <li><strong>30%</strong> → Du (deine Interessen)</li>
          <li><strong>20%</strong> → Channel (Community Events)</li>
          <li><strong>10%</strong> → Content Author</li>
        </ul>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions-section">
      <button @click="exportRevenue" class="btn-action">
        <span>📥</span>
        Export CSV
      </button>

      <button @click="clearRevenue" class="btn-action danger">
        <span>🗑️</span>
        Daten löschen
      </button>
    </div>

    <!-- Withdrawal Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showWithdrawalModal"
          class="modal-overlay"
          @click="showWithdrawalModal = false"
        >
          <div class="modal-content" @click.stop>
            <h2>Auszahlung beantragen</h2>
            <p>Verfügbarer Betrag: <strong>{{ formatCurrency(revenue.totalRevenue) }}</strong></p>

            <div class="withdrawal-options">
              <button
                @click="handleWithdrawal('paypal')"
                class="withdrawal-option"
              >
                <span class="option-icon">💳</span>
                <div>
                  <div class="option-title">PayPal</div>
                  <div class="option-desc">Sofortige Überweisung</div>
                </div>
              </button>

              <button
                @click="handleWithdrawal('sepa')"
                class="withdrawal-option"
              >
                <span class="option-icon">🏦</span>
                <div>
                  <div class="option-title">SEPA</div>
                  <div class="option-desc">Banküberweisung (1-3 Tage)</div>
                </div>
              </button>
            </div>

            <button @click="showWithdrawalModal = false" class="btn-cancel">
              Abbrechen
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRevenue } from '../stores/useRevenue'
import { useToast } from '../composables/useToast'

const revenue = useRevenue()
const { success, error } = useToast()
const showWithdrawalModal = ref(false)

const formatCurrency = (amount: number): string => {
  return '€' + amount.toFixed(2)
}

const exportRevenue = () => {
  revenue.exportData()
  success('Revenue Daten exportiert')
}

const clearRevenue = () => {
  revenue.clearData()
  success('Revenue Daten gelöscht')
}

const handleWithdrawal = async (method: 'paypal' | 'sepa') => {
  try {
    await revenue.withdraw(revenue.totalRevenue, method)
    success(`Auszahlung via ${method} beantragt`)
    showWithdrawalModal.value = false
  } catch (err: any) {
    error(err.message || 'Auszahlung fehlgeschlagen')
  }
}
</script>

<style scoped>
.revenue-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.dashboard-title .icon {
  font-size: 2.5rem;
}

.dashboard-subtitle {
  color: #94a3b8;
  font-size: 1rem;
  margin: 0;
}

/* Revenue Cards */
.revenue-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.revenue-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  transition: all 0.2s;
}

.revenue-card:hover {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}

.revenue-card.highlight {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  border-color: rgba(99, 102, 241, 0.4);
}

.card-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.card-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
}

.card-value.primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Withdrawal Section */
.withdrawal-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.withdrawal-info h3 {
  margin: 0 0 0.5rem 0;
  color: #f8fafc;
}

.withdrawal-info p {
  margin: 0;
  font-size: 0.875rem;
}

.available {
  color: #10b981;
}

.not-available {
  color: #f59e0b;
}

.btn-withdraw {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-withdraw:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

/* Interests Section */
.interests-section {
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 1rem 0;
}

.interests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.interest-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.interest-name {
  min-width: 120px;
  font-weight: 600;
  color: #cbd5e1;
  text-transform: capitalize;
}

.interest-stats {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.interest-bar {
  flex: 1;
  height: 8px;
  background: rgba(100, 116, 139, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.interest-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  transition: width 0.3s ease;
}

.interest-value {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 120px;
}

.percentage {
  color: #94a3b8;
  font-size: 0.875rem;
}

.amount {
  font-weight: 700;
  color: #10b981;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  padding: 1rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
}

/* Info Section */
.info-section {
  margin-bottom: 2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.info-number {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: 700;
  border-radius: 50%;
}

.info-content h4 {
  margin: 0 0 0.25rem 0;
  color: #f8fafc;
  font-size: 0.9375rem;
}

.info-content p {
  margin: 0;
  font-size: 0.8125rem;
  color: #94a3b8;
}

.info-breakdown {
  padding: 1.5rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.5rem;
}

.info-breakdown h4 {
  margin: 0 0 1rem 0;
  color: #f8fafc;
}

.info-breakdown ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #cbd5e1;
}

.info-breakdown li {
  margin-bottom: 0.5rem;
}

/* Actions */
.actions-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(100, 116, 139, 0.2);
  border: 1px solid rgba(100, 116, 139, 0.3);
  color: #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: rgba(100, 116, 139, 0.3);
  border-color: rgba(100, 116, 139, 0.5);
}

.btn-action.danger {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.btn-action.danger:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98));
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.modal-content h2 {
  margin: 0 0 1rem 0;
  color: #f8fafc;
}

.withdrawal-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
}

.withdrawal-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.withdrawal-option:hover {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(99, 102, 241, 0.3);
}

.option-icon {
  font-size: 2rem;
}

.option-title {
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.option-desc {
  font-size: 0.875rem;
  color: #94a3b8;
}

.btn-cancel {
  width: 100%;
  padding: 0.75rem;
  background: rgba(100, 116, 139, 0.2);
  border: 1px solid rgba(100, 116, 139, 0.3);
  color: #cbd5e1;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: rgba(100, 116, 139, 0.3);
}

/* Empty State */
.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  color: #64748b;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Mobile */
@media (max-width: 640px) {
  .dashboard-title {
    font-size: 1.5rem;
  }

  .revenue-cards {
    grid-template-columns: 1fr;
  }

  .withdrawal-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-withdraw {
    width: 100%;
    justify-content: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .actions-section {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
    justify-content: center;
  }
}
</style>

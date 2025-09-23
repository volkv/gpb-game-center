import type { BankProduct } from './ProductCatalog';

export interface ProductInteraction {
  productId: string;
  actionType: 'view' | 'cta_click' | 'learn_more' | 'quest_complete';
  timestamp: number;
  context?: string;
}

export interface WebViewBridge {
  navigateToProduct?: (productUrl: string, productId: string) => void;
  trackInteraction?: (interaction: ProductInteraction) => void;
  openExternalLink?: (url: string) => void;
}

declare global {
  interface Window {
    AndroidBridge?: WebViewBridge;
    webkit?: {
      messageHandlers?: {
        iOSBridge?: {
          postMessage: (message: ProductInteraction | { action: string; data: ProductInteraction | { url: string; productId: string; } }) => void;
        };
      };
    };
  }
}

class ProductIntegrationService {
  private interactions: ProductInteraction[] = [];

  trackInteraction(productId: string, actionType: ProductInteraction['actionType'], context?: string) {
    const interaction: ProductInteraction = {
      productId,
      actionType,
      timestamp: Date.now(),
      context
    };

    this.interactions.push(interaction);
    this.sendInteractionToNativeApp(interaction);

    console.log('Product interaction tracked:', interaction);
  }

  navigateToProduct(product: BankProduct, context?: string) {
    this.trackInteraction(product.id, 'cta_click', context);

    if (this.isWebViewEnvironment()) {
      this.sendToNativeApp('navigate', {
        url: product.ctaUrl,
        productId: product.id
      });
    } else {
      this.simulateNavigation(product);
    }
  }

  viewProductDetails(product: BankProduct, context?: string) {
    this.trackInteraction(product.id, 'view', context);
  }

  learnMoreAboutProduct(product: BankProduct, context?: string) {
    this.trackInteraction(product.id, 'learn_more', context);
  }

  completeProductQuest(productId: string, questId?: string) {
    this.trackInteraction(productId, 'quest_complete', questId);
  }

  private isWebViewEnvironment(): boolean {
    return !!(
      window.AndroidBridge ||
      window.webkit?.messageHandlers?.iOSBridge
    );
  }

  private sendToNativeApp(action: string, data: ProductInteraction | { url: string; productId: string }) {
    try {
      if (window.AndroidBridge) {
        switch (action) {
          case 'navigate':
            if ('url' in data && 'productId' in data) {
              window.AndroidBridge.navigateToProduct?.(data.url, data.productId);
            }
            break;
          case 'track':
            if ('actionType' in data) {
              window.AndroidBridge.trackInteraction?.(data as ProductInteraction);
            }
            break;
        }
      } else if (window.webkit?.messageHandlers?.iOSBridge) {
        window.webkit.messageHandlers.iOSBridge.postMessage({
          action,
          data
        });
      }
    } catch (error) {
      console.error('Error communicating with native app:', error);
      this.fallbackAction(action, data);
    }
  }

  private sendInteractionToNativeApp(interaction: ProductInteraction) {
    this.sendToNativeApp('track', interaction);
  }

  private simulateNavigation(product: BankProduct) {
    const message = `🏦 Переход в приложение Газпромбанка\n\n📍 Раздел: ${product.title}\n🔗 ${product.ctaText}\n\n💡 В реальном приложении здесь будет переход к продукту "${product.title}"`;

    if (globalThis.confirm(message + '\n\nОткрыть в новой вкладке? (для демонстрации)')) {
      window.open('#/demo-product/' + product.id, '_blank');
    }
  }

  private fallbackAction(action: string, data: { productId: string; productTitle?: string }) {
    if (action === 'navigate') {
      this.simulateNavigation({
        id: data.productId,
        title: data.productTitle || 'Банковский продукт',
        ctaText: 'Узнать больше',
        ctaUrl: '#'
      } as BankProduct);
    }
  }

  getInteractionStats() {
    const stats = {
      totalInteractions: this.interactions.length,
      byActionType: {} as Record<string, number>,
      byProduct: {} as Record<string, number>,
      recentInteractions: this.interactions.slice(-10)
    };

    this.interactions.forEach(interaction => {
      stats.byActionType[interaction.actionType] = (stats.byActionType[interaction.actionType] || 0) + 1;
      stats.byProduct[interaction.productId] = (stats.byProduct[interaction.productId] || 0) + 1;
    });

    return stats;
  }

  exportInteractions() {
    return [...this.interactions];
  }

  clearInteractions() {
    this.interactions = [];
  }
}

export const productIntegration = new ProductIntegrationService();
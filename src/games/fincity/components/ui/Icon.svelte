<script lang="ts">
  import awardRaw from '../../public/assets/icons/award.svg?raw';
  import batteryRaw from '../../public/assets/icons/battery.svg?raw';
  import bookRaw from '../../public/assets/icons/book.svg?raw';
  import buildingRaw from '../../public/assets/icons/building.svg?raw';
  import businessmanRaw from '../../public/assets/icons/businessman.svg?raw';
  import castleRaw from '../../public/assets/icons/castle.svg?raw';
  import chatRaw from '../../public/assets/icons/chat.svg?raw';
  import checkmarkRaw from '../../public/assets/icons/checkmark.svg?raw';
  import churchRaw from '../../public/assets/icons/church.svg?raw';
  import cityRaw from '../../public/assets/icons/city.svg?raw';
  import constructionSiteRaw from '../../public/assets/icons/construction-site.svg?raw';
  import craneRaw from '../../public/assets/icons/crane.svg?raw';
  import creditCardRaw from '../../public/assets/icons/credit-card.svg?raw';
  import crownRaw from '../../public/assets/icons/crown.svg?raw';
  import currencyIconRaw from '../../public/assets/icons/currency-icon.svg?raw';
  import excavatorRaw from '../../public/assets/icons/excavator.svg?raw';
  import factoryRaw from '../../public/assets/icons/factory.svg?raw';
  import flowerRaw from '../../public/assets/icons/flower.svg?raw';
  import flowerInPotRaw from '../../public/assets/icons/flower-in-pot.svg?raw';
  import gemRaw from '../../public/assets/icons/gem.svg?raw';
  import giftRaw from '../../public/assets/icons/gift.svg?raw';
  import growingCoinsChartRaw from '../../public/assets/icons/growing-coins-chart.svg?raw';
  import hammerRaw from '../../public/assets/icons/hammer.svg?raw';
  import handWithGrowingCoinRaw from '../../public/assets/icons/hand-with-growing-coin-on-in.svg?raw';
  import handshakeRaw from '../../public/assets/icons/handshake.svg?raw';
  import happinessSmileRaw from '../../public/assets/icons/happiness-smile.svg?raw';
  import heartRaw from '../../public/assets/icons/heart.svg?raw';
  import houseWithPercentRaw from '../../public/assets/icons/house-with-percent-sign.svg?raw';
  import housesRaw from '../../public/assets/icons/2-houses.svg?raw';
  import leaderboardRaw from '../../public/assets/icons/leaderboard.svg?raw';
  import mallRaw from '../../public/assets/icons/mall.svg?raw';
  import manRaw from '../../public/assets/icons/man.svg?raw';
  import medalRaw from '../../public/assets/icons/medal.svg?raw';
  import menuRaw from '../../public/assets/icons/menu.svg?raw';
  import moneyRaw from '../../public/assets/icons/money.svg?raw';
  import playButtonRaw from '../../public/assets/icons/play-button.svg?raw';
  import plusIconRaw from '../../public/assets/icons/plus-icon.svg?raw';
  import policemanRaw from '../../public/assets/icons/policeman.svg?raw';
  import scrollRaw from '../../public/assets/icons/scroll.svg?raw';
  import scrollTextRaw from '../../public/assets/icons/scroll-text.svg?raw';
  import searchRaw from '../../public/assets/icons/search.svg?raw';
  import settingsRaw from '../../public/assets/icons/settings.svg?raw';
  import shieldRaw from '../../public/assets/icons/shield.svg?raw';
  import shoppingCartRaw from '../../public/assets/icons/shopping-cart.svg?raw';
  import skyscrapperRaw from '../../public/assets/icons/skyscrapper.svg?raw';
  import smsIconRaw from '../../public/assets/icons/sms-icon.svg?raw';
  import starRaw from '../../public/assets/icons/star.svg?raw';
  import targetRaw from '../../public/assets/icons/target.svg?raw';
  import thumbUpRaw from '../../public/assets/icons/thumb-up.svg?raw';
  import trendingUpRaw from '../../public/assets/icons/trending-up.svg?raw';
  import trophyRaw from '../../public/assets/icons/trophy.svg?raw';
  import umbrellaRaw from '../../public/assets/icons/umbrella.svg?raw';
  import xRaw from '../../public/assets/icons/x.svg?raw';
  import zapRaw from '../../public/assets/icons/zap.svg?raw';

  export type IconName =
    | 'award' | 'battery' | 'book' | 'building' | 'businessman' | 'castle' | 'chat' | 'checkmark' | 'church' | 'city'
    | 'construction-site' | 'crane' | 'credit-card' | 'crown' | 'currency-icon' | 'excavator' | 'factory' | 'flower'
    | 'flower-in-pot' | 'gem' | 'gift' | 'growing-coins-chart' | 'hammer' | 'hand-with-growing-coin' | 'handshake'
    | 'happiness-smile' | 'heart' | 'house-with-percent' | 'houses' | 'leaderboard' | 'mall' | 'man' | 'medal'
    | 'menu' | 'money' | 'play-button' | 'plus-icon' | 'policeman' | 'scroll' | 'scroll-text' | 'search' | 'settings'
    | 'shield' | 'shopping-cart' | 'skyscrapper' | 'sms-icon' | 'star' | 'target' | 'thumb-up' | 'trending-up'
    | 'trophy' | 'umbrella' | 'x' | 'zap'
    // Aliases for common use cases
    | 'close' | 'coin' | 'crystal' | 'quest' | 'check' | 'grid' | 'home' | 'experience' | 'energy' | 'bank' | 'achievement' | 'level';

  interface Props {
    name?: IconName;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    color?: string;
    class?: string;
  }

  let {
    name = 'currency-icon',
    size = 'md',
    color,
    class: className = '',
    ...restProps
  }: Props = $props();

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-12 h-12',
    '3xl': 'w-16 h-16'
  };

  const iconMapping: Record<IconName, string> = {
    'award': awardRaw,
    'battery': batteryRaw,
    'book': bookRaw,
    'building': buildingRaw,
    'businessman': businessmanRaw,
    'castle': castleRaw,
    'chat': chatRaw,
    'checkmark': checkmarkRaw,
    'church': churchRaw,
    'city': cityRaw,
    'construction-site': constructionSiteRaw,
    'crane': craneRaw,
    'credit-card': creditCardRaw,
    'crown': crownRaw,
    'currency-icon': currencyIconRaw,
    'excavator': excavatorRaw,
    'factory': factoryRaw,
    'flower': flowerRaw,
    'flower-in-pot': flowerInPotRaw,
    'gem': gemRaw,
    'gift': giftRaw,
    'growing-coins-chart': growingCoinsChartRaw,
    'hammer': hammerRaw,
    'hand-with-growing-coin': handWithGrowingCoinRaw,
    'handshake': handshakeRaw,
    'happiness-smile': happinessSmileRaw,
    'heart': heartRaw,
    'house-with-percent': houseWithPercentRaw,
    'houses': housesRaw,
    'leaderboard': leaderboardRaw,
    'mall': mallRaw,
    'man': manRaw,
    'medal': medalRaw,
    'menu': menuRaw,
    'money': moneyRaw,
    'play-button': playButtonRaw,
    'plus-icon': plusIconRaw,
    'policeman': policemanRaw,
    'scroll': scrollRaw,
    'scroll-text': scrollTextRaw,
    'search': searchRaw,
    'settings': settingsRaw,
    'shield': shieldRaw,
    'shopping-cart': shoppingCartRaw,
    'skyscrapper': skyscrapperRaw,
    'sms-icon': smsIconRaw,
    'star': starRaw,
    'target': targetRaw,
    'thumb-up': thumbUpRaw,
    'trending-up': trendingUpRaw,
    'trophy': trophyRaw,
    'umbrella': umbrellaRaw,
    'x': xRaw,
    'zap': zapRaw,
    // Aliases
    'close': xRaw,
    'coin': currencyIconRaw,
    'crystal': gemRaw,
    'quest': scrollRaw,
    'check': checkmarkRaw,
    'grid': menuRaw,
    'home': buildingRaw,
    'experience': starRaw,
    'energy': batteryRaw,
    'bank': buildingRaw,
    'achievement': trophyRaw,
    'level': starRaw,
    'security': shieldRaw
  };

  const iconClasses = $derived(`${sizeClasses[size]} ${className}`.trim());
  const iconContent = $derived(iconMapping[name] || iconMapping['currency-icon']);


  const processedIconContent = $derived(() => {
    let svgContent = iconContent;

    svgContent = svgContent.replace(/width="[^"]*"/g, 'width="100%"');
    svgContent = svgContent.replace(/height="[^"]*"/g, 'height="100%"');

    if (!svgContent.includes('viewBox')) {
      svgContent = svgContent.replace(/<svg([^>]*?)>/g, '<svg$1 viewBox="0 0 24 24">');
    }

    return svgContent;
  });

  const cssStyles = $derived(() => {
    if (color) {
      return `color: ${color};`;
    }
    return '';
  });
</script>

<div
  class={iconClasses}
  style={cssStyles()}
  {...restProps}
>
  {@html processedIconContent()}
</div>
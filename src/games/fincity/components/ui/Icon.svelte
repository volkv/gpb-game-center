<script lang="ts">
	import {
		Award,
		Battery,
		Book,
		Building,
		User,
		Crown,
		Church,
		MapPin,
		Construction,
		Truck,
		CreditCard,
		DollarSign,
		Factory,
		Flower,
		Flower2,
		Gem,
		Gift,
		TrendingUp,
		Hammer,
		HandCoins,
		Handshake,
		Smile,
		Heart,
		Home,
		Trophy,
		ShoppingCart,
		Building2,
		MessageSquare,
		Star,
		CheckCircle,
		Menu,
		Coins,
		Play,
		Plus,
		Shield,
		ScrollText,
		Search,
		Settings,
		Target,
		ThumbsUp,
		Umbrella,
		X,
		Zap
	} from 'lucide-svelte';

	export type IconName =
		| 'award' | 'battery' | 'book' | 'building' | 'businessman' | 'castle' | 'chat' | 'checkmark' | 'church' | 'city'
		| 'construction-site' | 'crane' | 'credit-card' | 'crown' | 'currency-icon' | 'excavator' | 'factory' | 'flower'
		| 'flower-in-pot' | 'gem' | 'gift' | 'growing-coins-chart' | 'hammer' | 'hand-with-growing-coin' | 'handshake'
		| 'happiness-smile' | 'heart' | 'house-with-percent' | 'houses' | 'leaderboard' | 'mall' | 'man' | 'medal'
		| 'menu' | 'money' | 'play-button' | 'plus-icon' | 'policeman' | 'scroll' | 'scroll-text' | 'search' | 'settings'
		| 'shield' | 'shopping-cart' | 'skyscrapper' | 'sms-icon' | 'star' | 'target' | 'thumb-up' | 'trending-up'
		| 'trophy' | 'umbrella' | 'x' | 'zap'
		// Aliases for common use cases
		| 'close' | 'coin' | 'crystal' | 'quest' | 'check' | 'grid' | 'home' | 'experience' | 'energy' | 'bank' | 'achievement' | 'level' | 'security';

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

	const sizeMap = {
		xs: 12,
		sm: 16,
		md: 20,
		lg: 24,
		xl: 32,
		'2xl': 48,
		'3xl': 64
	};

	const iconComponents = {
		'award': Award,
		'battery': Battery,
		'book': Book,
		'building': Building,
		'businessman': User,
		'castle': Crown,
		'chat': MessageSquare,
		'checkmark': CheckCircle,
		'church': Church,
		'city': MapPin,
		'construction-site': Construction,
		'crane': Construction,
		'credit-card': CreditCard,
		'crown': Crown,
		'currency-icon': DollarSign,
		'excavator': Truck,
		'factory': Factory,
		'flower': Flower,
		'flower-in-pot': Flower2,
		'gem': Gem,
		'gift': Gift,
		'growing-coins-chart': TrendingUp,
		'hammer': Hammer,
		'hand-with-growing-coin': HandCoins,
		'handshake': Handshake,
		'happiness-smile': Smile,
		'heart': Heart,
		'house-with-percent': Home,
		'houses': Building2,
		'leaderboard': Trophy,
		'mall': ShoppingCart,
		'man': User,
		'medal': Award,
		'menu': Menu,
		'money': Coins,
		'play-button': Play,
		'plus-icon': Plus,
		'policeman': Shield,
		'scroll': ScrollText,
		'scroll-text': ScrollText,
		'search': Search,
		'settings': Settings,
		'shield': Shield,
		'shopping-cart': ShoppingCart,
		'skyscrapper': Building2,
		'sms-icon': MessageSquare,
		'star': Star,
		'target': Target,
		'thumb-up': ThumbsUp,
		'trending-up': TrendingUp,
		'trophy': Trophy,
		'umbrella': Umbrella,
		'x': X,
		'zap': Zap,
		// Aliases
		'close': X,
		'coin': Coins,
		'crystal': Gem,
		'quest': ScrollText,
		'check': CheckCircle,
		'grid': Menu,
		'home': Building,
		'experience': Star,
		'energy': Battery,
		'bank': Building,
		'achievement': Trophy,
		'level': Star,
		'security': Shield
	};

	const IconComponent = $derived(iconComponents[name] || iconComponents['currency-icon']);
	const iconSize = $derived(sizeMap[size]);

	const iconClasses = $derived(`inline-block ${className}`.trim());

	const iconStyles = $derived(() => {
		if (color) {
			return `color: ${color};`;
		}
		return '';
	});
</script>

{#if IconComponent}
	<IconComponent
		size={iconSize}
		class={iconClasses}
		style={iconStyles()}
		{...restProps}
	/>
{/if}
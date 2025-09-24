<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, GameLayout } from '$lib';
	import { ChevronLeft, CheckCircle, Trophy } from 'lucide-svelte';

	interface Props {
		onexit?: () => void;
	}

	let { onexit }: Props = $props();

	let mounted = $state(false);
	let currentInput = $state('');
	let showResult = $state(false);
	let showDefinition = $state(false);

	const targetWord = 'ВКЛАД';
	const wordLength = 5;

	const completedWords = [
		{ word: 'БАНК', definition: 'Финансовая организация' },
		{ word: 'КАРТА', definition: 'Платежный инструмент' },
		{ word: 'КРЕДИТ', definition: 'Заемные средства' },
		{ word: 'ПРОЦЕНТ', definition: 'Доходность вложений' }
	];

	let inputLetters = $state(Array(wordLength).fill(''));
	let currentLetterIndex = $state(0);

	onMount(() => {
		mounted = true;
	});

	function handleKeyPress(event: KeyboardEvent) {
		if (showResult) return;

		const key = event.key.toUpperCase();

		if (key === 'BACKSPACE') {
			if (currentLetterIndex > 0) {
				currentLetterIndex--;
				inputLetters[currentLetterIndex] = '';
				inputLetters = [...inputLetters];
			}
		} else if (key.match(/[А-Я]/)) {
			if (currentLetterIndex < wordLength) {
				inputLetters[currentLetterIndex] = key;
				inputLetters = [...inputLetters];
				currentLetterIndex++;

				if (currentLetterIndex === wordLength) {
					checkWord();
				}
			}
		} else if (key === 'ENTER' && currentLetterIndex === wordLength) {
			checkWord();
		}
	}

	function handleLetterClick(index: number) {
		if (showResult) return;
		currentLetterIndex = index;
	}

	function checkWord() {
		const enteredWord = inputLetters.join('');
		if (enteredWord === targetWord) {
			showResult = true;
			setTimeout(() => {
				showDefinition = true;
			}, 1000);
		}
	}

	function getLetterStatus(wordIndex: number, letterIndex: number, letter: string) {
		if (wordIndex < completedWords.length) {
			return 'correct';
		}

		if (!showResult) {
			return 'empty';
		}

		const targetLetter = targetWord[letterIndex];
		if (letter === targetLetter) {
			return 'correct';
		}
		return 'empty';
	}
</script>

<svelte:window on:keydown={handleKeyPress} />

<GameLayout
	gameName="Финансовый Кроссворд"
	customBackground="linear-gradient(135deg, var(--color-gpb-violet) 0%, var(--color-gpb-mint) 100%)"
	showScore={true}
>
	<div class="crossword-content" class:mounted>
		<div class="game-info">
			<p class="instruction font-body text-body text-gray-700">
				Введите финансовый термин из 5 букв
			</p>
			<p class="hint font-body text-body-sm text-gray-600">
				💡 Место, где деньги приносят проценты
			</p>
		</div>

		<div class="words-grid">
			{#each completedWords as wordData, wordIndex}
				<div class="word-row completed">
					{#each wordData.word.split('') as letter, letterIndex}
						<div
							class="letter-cell"
							class:correct={true}
							style="--animation-delay: {wordIndex * 200 + letterIndex * 50}ms"
						>
							{letter}
						</div>
					{/each}
				</div>
			{/each}

			<div class="word-row current" class:winning={showResult}>
				{#each inputLetters as letter, letterIndex}
					<div
						class="letter-cell"
						class:filled={letter !== ''}
						class:active={currentLetterIndex === letterIndex && !showResult}
						class:correct={showResult && letter === targetWord[letterIndex]}
						class:winning-cell={showResult}
						style="--animation-delay: {(completedWords.length * 200) + letterIndex * 100}ms"
						onclick={() => handleLetterClick(letterIndex)}
						onkeydown={(e) => e.key === 'Enter' && handleLetterClick(letterIndex)}
						role="button"
						tabindex="0"
					>
						{letter}
						{#if currentLetterIndex === letterIndex && !showResult}
							<div class="cursor"></div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		{#if showResult && showDefinition}
			<div class="definition-card">
				<div class="card-header">
					<h3 class="font-heading text-h4 text-gpb-black">
						{targetWord}
					</h3>
					<CheckCircle class="text-green-500 neon-glow" size={24} />
				</div>

				<p class="definition-text font-body text-body text-gray-700">
					<strong>ВКЛАД</strong> — денежные средства, размещенные в банке на определенный срок под проценты.
					Надежный способ защитить сбережения от инфляции и получить стабильный доход.
				</p>

				<div class="product-info">
					<h4 class="font-heading text-base font-semibold text-gpb-violet mb-2">
						🏦 Вклады Газпромбанка
					</h4>
					<ul class="benefits-list font-body text-body-sm text-gray-600">
						<li>• Ставки до 12% годовых</li>
						<li>• Страхование АСВ до 1,4 млн ₽</li>
						<li>• Пополнение и частичное снятие</li>
					</ul>

					<Button variant="secondary" size="sm" disabled class="product-button">
						Узнать о вкладах
					</Button>
				</div>
			</div>
		{/if}

		{#if !showResult}
			<div class="game-stats">
				<div class="stat-item">
					<span class="stat-label">Прогресс</span>
					<span class="stat-value">{completedWords.length + 1}/5</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Очки</span>
					<span class="stat-value">480</span>
				</div>
			</div>
		{:else}
			<div class="victory-message">
				<Trophy class="text-gpb-gold neon-glow animate-pulse" size={48} />
				<h2 class="victory-text font-heading text-h3 text-gpb-black">
					Отлично!
				</h2>
				<p class="victory-subtitle font-body text-body text-gray-600">
					Вы успешно разгадали финансовый термин
				</p>
			</div>
		{/if}

		<div class="keyboard-hint">
			<p class="font-body text-caption text-gray-500">
				Используйте клавиатуру для ввода букв
			</p>
		</div>
	</div>
</GameLayout>

<style>
	.crossword-content {
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s ease-out;
	}

	.crossword-content.mounted {
		opacity: 1;
		transform: translateY(0);
	}

	.game-info {
		text-align: center;
		margin-bottom: 2rem;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(12px) saturate(180%);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 1rem;
	}

	.instruction {
		color: white;
		margin-bottom: 0.5rem;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.hint {
		color: rgba(255, 255, 255, 0.9);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.words-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.word-row {
		display: flex;
		justify-content: center;
		gap: 0.25rem;
	}

	.word-row.winning {
		animation: wordWin 1s ease-out;
	}

	.letter-cell {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.9);
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-gpb-black);
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		animation: cellAppear 0.4s ease-out;
		animation-delay: var(--animation-delay);
		animation-fill-mode: both;
	}

	.letter-cell.filled {
		background: rgba(255, 255, 255, 1);
		border-color: var(--color-gpb-violet);
		transform: scale(1.05);
	}

	.letter-cell.active {
		border-color: var(--color-gpb-mint);
		background: rgba(88, 255, 255, 0.2);
		box-shadow: 0 0 12px rgba(88, 255, 255, 0.4);
	}

	.letter-cell.correct {
		background: var(--color-gpb-mint);
		border-color: var(--color-gpb-emerald);
		color: var(--color-gpb-black);
		font-weight: 700;
	}

	.letter-cell.winning-cell {
		animation: letterWin 0.6s ease-out;
		animation-delay: calc(var(--animation-delay) / 4);
	}

	.cursor {
		position: absolute;
		right: 4px;
		top: 50%;
		transform: translateY(-50%);
		width: 2px;
		height: 60%;
		background: var(--color-gpb-violet);
		animation: blink 1.2s infinite;
	}

	.definition-card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 16px;
		padding: 1.5rem;
		margin-bottom: 2rem;
		animation: cardSlideIn 0.6s ease-out;
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}


	.definition-text {
		line-height: 1.5;
		margin-bottom: 1.5rem;
	}

	.product-info {
		background: rgba(25, 25, 239, 0.05);
		border: 1px solid rgba(25, 25, 239, 0.1);
		border-radius: 12px;
		padding: 1rem;
	}

	.benefits-list {
		list-style: none;
		padding: 0;
		margin: 0.75rem 0;
	}

	.benefits-list li {
		margin-bottom: 0.25rem;
	}

	.game-stats {
		display: flex;
		justify-content: center;
		gap: 2rem;
		margin-bottom: 1.5rem;
	}

	.stat-item {
		text-align: center;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 0.75rem 1rem;
	}

	.stat-label {
		display: block;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 0.25rem;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.stat-value {
		display: block;
		font-family: var(--font-heading);
		font-size: 1.125rem;
		font-weight: 600;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.victory-message {
		text-align: center;
		margin-bottom: 2rem;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		padding: 2rem;
		animation: victoryAppear 0.8s ease-out;
	}


	.victory-text {
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		margin-bottom: 0.5rem;
	}

	.victory-subtitle {
		color: rgba(255, 255, 255, 0.9);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.keyboard-hint {
		text-align: center;
	}

	.keyboard-hint p {
		color: rgba(255, 255, 255, 0.7);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	@keyframes cellAppear {
		0% {
			opacity: 0;
			transform: scale(0.5) rotateY(90deg);
		}
		70% {
			transform: scale(1.1) rotateY(-10deg);
		}
		100% {
			opacity: 1;
			transform: scale(1) rotateY(0deg);
		}
	}

	@keyframes wordWin {
		0% { transform: scale(1); }
		50% { transform: scale(1.05); }
		100% { transform: scale(1); }
	}

	@keyframes letterWin {
		0% {
			transform: scale(1);
			background: rgba(255, 255, 255, 1);
		}
		50% {
			transform: scale(1.2);
			background: var(--color-gpb-mint);
			box-shadow: 0 0 20px var(--color-gpb-mint);
		}
		100% {
			transform: scale(1.05);
			background: var(--color-gpb-mint);
		}
	}

	@keyframes blink {
		0%, 50% { opacity: 1; }
		51%, 100% { opacity: 0; }
	}

	@keyframes cardSlideIn {
		0% {
			opacity: 0;
			transform: translateY(20px) scale(0.95);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes bounce {
		0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
		40% { transform: translateY(-10px); }
		60% { transform: translateY(-5px); }
	}

	@keyframes victoryAppear {
		0% {
			opacity: 0;
			transform: scale(0.8) translateY(30px);
		}
		60% {
			transform: scale(1.05) translateY(-5px);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	@keyframes celebrate {
		0%, 100% { transform: rotate(0deg) scale(1); }
		25% { transform: rotate(-5deg) scale(1.1); }
		75% { transform: rotate(5deg) scale(1.1); }
	}

	@media (max-width: 380px) {
		.letter-cell {
			width: 40px;
			height: 40px;
			font-size: 1rem;
		}

		.game-stats {
			gap: 1rem;
		}

		.stat-item {
			padding: 0.5rem 0.75rem;
		}
	}
</style>
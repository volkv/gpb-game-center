<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Button } from '$lib';

	const dispatch = createEventDispatcher<{
		exit: void;
	}>();

	let mounted = false;
	let currentInput = '';
	let showResult = false;
	let showDefinition = false;

	const targetWord = 'ВКЛАД';
	const wordLength = 5;

	const completedWords = [
		{ word: 'БАНК', definition: 'Финансовая организация' },
		{ word: 'КАРТА', definition: 'Платежный инструмент' },
		{ word: 'КРЕДИТ', definition: 'Заемные средства' },
		{ word: 'ПРОЦЕНТ', definition: 'Доходность вложений' }
	];

	let inputLetters = Array(wordLength).fill('');
	let currentLetterIndex = 0;

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

	function handleExit() {
		dispatch('exit');
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

<div class="crossword-game">
	<header class="game-header">
		<button
			class="back-button"
			on:click={handleExit}
			aria-label="Вернуться в игровой центр"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		<div class="game-title">
			<h1 class="font-heading text-h4 text-gpb-black">Финансовый Кроссворд</h1>
			<p class="font-body text-body-sm text-gray-600">Интеллектуальная игра</p>
		</div>
	</header>

	<div class="game-container" class:mounted>
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
						on:click={() => handleLetterClick(letterIndex)}
						on:keydown={(e) => e.key === 'Enter' && handleLetterClick(letterIndex)}
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
					<div class="success-icon">✅</div>
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
				<div class="victory-icon">🎉</div>
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
</div>

<style>
	.crossword-game {
		min-height: 100vh;
		background: linear-gradient(135deg,
			var(--color-gpb-violet) 0%,
			var(--color-gpb-cumin) 100%);
		padding: 1rem;
		position: relative;
	}

	.crossword-game::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Crect x='0' y='0' width='20' height='20'/%3E%3Crect x='20' y='20' width='20' height='20'/%3E%3C/g%3E%3C/svg%3E");
		opacity: 0.5;
	}

	.game-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		position: relative;
		z-index: 2;
	}

	.back-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
	}

	.back-button:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateX(-2px);
	}

	.game-title h1,
	.game-title p {
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.game-container {
		max-width: 400px;
		margin: 0 auto;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s ease-out;
		position: relative;
		z-index: 2;
	}

	.game-container.mounted {
		opacity: 1;
		transform: translateY(0);
	}

	.game-info {
		text-align: center;
		margin-bottom: 2rem;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
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
		border-color: var(--color-gpb-melissa);
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

	.success-icon {
		font-size: 1.5rem;
		animation: bounce 0.6s ease-out;
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

	.victory-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		animation: celebrate 1s ease-out;
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
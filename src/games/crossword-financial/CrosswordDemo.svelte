<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, GameLayout } from '$lib';
	import { CheckCircle, Trophy, XCircle } from 'lucide-svelte';

	interface Props {
		onexit?: () => void;
	}

	let { onexit }: Props = $props();

	// Types
	type LetterStatus = 'empty' | 'filled' | 'correct' | 'present' | 'absent';
	type GameState = 'playing' | 'won' | 'lost';

	interface Attempt {
		letters: string[];
		statuses: LetterStatus[];
		submitted: boolean;
	}

	// Game constants
	const financialWords = [
		{ word: 'ВКЛАД', hint: 'Место, где деньги приносят проценты', definition: 'денежные средства, размещенные в банке на определенный срок под проценты. Надежный способ защитить сбережения от инфляции и получить стабильный доход.' },
		{ word: 'КРЕДИТ', hint: 'Заемные средства под проценты', definition: 'денежные средства, предоставляемые банком в долг на определенный срок под проценты. Позволяет получить нужную сумму сейчас с обязательством вернуть с процентами.' },
		{ word: 'КАРТА', hint: 'Пластиковый платежный инструмент', definition: 'банковский платежный инструмент для безналичных расчетов. Обеспечивает удобство и безопасность платежей.' },
		{ word: 'РУБЛЬ', hint: 'Национальная валюта России', definition: 'официальная денежная единица Российской Федерации. Основа российской финансовой системы.' },
		{ word: 'ДОХОД', hint: 'Прибыль от инвестиций или работы', definition: 'денежные средства, получаемые от различных источников: работы, инвестиций, бизнеса.' }
	];

	let currentWordData = $state(financialWords[Math.floor(Math.random() * financialWords.length)]);
	const targetWord = $derived(currentWordData.word);
	const wordLength = $derived(targetWord.length);
	const maxAttempts = 5;

	// State
	let mounted = $state(false);
	let gameState = $state<GameState>('playing');
	let showResult = $state(false);
	let showDefinition = $state(false);

	let attempts = $state<Attempt[]>(Array(maxAttempts).fill(null).map(() => ({
		letters: Array(wordLength).fill(''),
		statuses: Array(wordLength).fill('empty'),
		submitted: false
	})));

	let currentAttemptIndex = $state(0);
	let currentLetterIndex = $state(0);

	// Экранная клавиатура
	const keyboardLayout = [
		['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З'],
		['Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж'],
		['ENTER', 'Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю', '⌫']
	];

	let keyStatuses = $state<Record<string, LetterStatus>>({});

	onMount(() => {
		mounted = true;
	});

	function handleKeyPress(event: KeyboardEvent) {
		if (gameState !== 'playing') return;

		const key = event.key.toUpperCase();
		const currentAttempt = attempts[currentAttemptIndex];

		if (key === 'BACKSPACE') {
			if (currentLetterIndex > 0) {
				currentLetterIndex--;
				currentAttempt.letters[currentLetterIndex] = '';
				currentAttempt.statuses[currentLetterIndex] = 'empty';
				attempts = [...attempts];
			}
		} else if (key === 'ENTER') {
			if (currentLetterIndex === wordLength) {
				submitAttempt();
			}
		} else if (key.match(/[А-Я]/) && currentLetterIndex < wordLength) {
			currentAttempt.letters[currentLetterIndex] = key;
			currentAttempt.statuses[currentLetterIndex] = 'filled';
			currentLetterIndex++;
			attempts = [...attempts];
		}
	}

	function handleLetterClick(attemptIndex: number, letterIndex: number) {
		if (gameState !== 'playing' || attemptIndex !== currentAttemptIndex) return;
		currentLetterIndex = letterIndex;
	}

	function submitAttempt() {
		if (!canSubmitAttempt()) return;

		const currentAttempt = attempts[currentAttemptIndex];
		const guessWord = currentAttempt.letters.join('');

		// Проверка каждой буквы
		const statuses = checkWordLetters(guessWord, targetWord);
		currentAttempt.statuses = statuses;
		currentAttempt.submitted = true;

		// Обновляем статусы клавиш на клавиатуре
		updateKeyboardStatuses(guessWord, statuses);

		// Проверка победы
		if (guessWord === targetWord) {
			gameState = 'won';
			showResult = true;
			setTimeout(() => {
				showDefinition = true;
			}, 1500);
		} else if (currentAttemptIndex === maxAttempts - 1) {
			// Последняя попытка
			gameState = 'lost';
			showResult = true;
		} else {
			// Переход к следующей попытке
			currentAttemptIndex++;
			currentLetterIndex = 0;
		}

		attempts = [...attempts];
	}

	function checkWordLetters(guess: string, target: string): LetterStatus[] {
		const result: LetterStatus[] = Array(wordLength).fill('absent');
		const targetChars = target.split('');
		const guessChars = guess.split('');

		// Первый проход: помечаем точные совпадения (зеленые)
		for (let i = 0; i < wordLength; i++) {
			if (guessChars[i] === targetChars[i]) {
				result[i] = 'correct';
				targetChars[i] = '*'; // Помечаем как использованную
			}
		}

		// Второй проход: помечаем буквы не на своем месте (желтые)
		for (let i = 0; i < wordLength; i++) {
			if (result[i] === 'absent') {
				const targetIndex = targetChars.indexOf(guessChars[i]);
				if (targetIndex !== -1) {
					result[i] = 'present';
					targetChars[targetIndex] = '*'; // Помечаем как использованную
				}
			}
		}

		return result;
	}

	function canSubmitAttempt(): boolean {
		const currentAttempt = attempts[currentAttemptIndex];
		return currentAttempt.letters.every(letter => letter !== '') &&
			   gameState === 'playing' &&
			   currentAttemptIndex < maxAttempts;
	}

	function updateKeyboardStatuses(guessWord: string, statuses: LetterStatus[]) {
		for (let i = 0; i < guessWord.length; i++) {
			const letter = guessWord[i];
			const status = statuses[i];

			// Обновляем статус только если он лучше текущего
			// correct > present > absent > empty
			const currentStatus = keyStatuses[letter];
			if (!currentStatus ||
				(status === 'correct') ||
				(status === 'present' && currentStatus !== 'correct') ||
				(status === 'absent' && currentStatus !== 'correct' && currentStatus !== 'present')) {
				keyStatuses[letter] = status;
			}
		}
		keyStatuses = {...keyStatuses}; // Trigger reactivity
	}

	function handleKeyboardClick(key: string) {
		if (gameState !== 'playing') return;

		if (key === 'ENTER') {
			if (currentLetterIndex === wordLength) {
				submitAttempt();
			}
		} else if (key === '⌫') {
			if (currentLetterIndex > 0) {
				currentLetterIndex--;
				const currentAttempt = attempts[currentAttemptIndex];
				currentAttempt.letters[currentLetterIndex] = '';
				currentAttempt.statuses[currentLetterIndex] = 'empty';
				attempts = [...attempts];
			}
		} else if (currentLetterIndex < wordLength) {
			const currentAttempt = attempts[currentAttemptIndex];
			currentAttempt.letters[currentLetterIndex] = key;
			currentAttempt.statuses[currentLetterIndex] = 'filled';
			currentLetterIndex++;
			attempts = [...attempts];
		}
	}

	function resetGame() {
		// Выбираем новое случайное слово
		currentWordData = financialWords[Math.floor(Math.random() * financialWords.length)];

		gameState = 'playing';
		showResult = false;
		showDefinition = false;
		currentAttemptIndex = 0;
		currentLetterIndex = 0;

		// Сбрасываем статусы клавиш
		keyStatuses = {};

		attempts = Array(maxAttempts).fill(null).map(() => ({
			letters: Array(wordLength).fill(''),
			statuses: Array(wordLength).fill('empty'),
			submitted: false
		}));
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
			<p class="hint font-body text-body-sm text-gray-600">
				💡 {currentWordData.hint}
			</p>
		</div>

		<div class="words-grid" style="--word-length: {wordLength}">
			{#each attempts as attempt, attemptIndex}
				<div class="word-row"
					 class:current={attemptIndex === currentAttemptIndex && gameState === 'playing'}
					 class:submitted={attempt.submitted}
					 class:winning={gameState === 'won' && attemptIndex === currentAttemptIndex}>
					{#each attempt.letters as letter, letterIndex}
						<div
							class="letter-cell"
							class:filled={attempt.statuses[letterIndex] === 'filled'}
							class:active={attemptIndex === currentAttemptIndex &&
										 letterIndex === currentLetterIndex &&
										 gameState === 'playing'}
							class:correct={attempt.statuses[letterIndex] === 'correct'}
							class:present={attempt.statuses[letterIndex] === 'present'}
							class:absent={attempt.statuses[letterIndex] === 'absent'}
							style="--animation-delay: {attemptIndex * 100 + letterIndex * 50}ms"
							onclick={() => handleLetterClick(attemptIndex, letterIndex)}
							onkeydown={(e) => e.key === 'Enter' && handleLetterClick(attemptIndex, letterIndex)}
							role="button"
							tabindex="0"
						>
							{letter}
							{#if attemptIndex === currentAttemptIndex &&
								 letterIndex === currentLetterIndex &&
								 gameState === 'playing'}
								<div class="cursor"></div>
							{/if}
						</div>
					{/each}
				</div>
			{/each}
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
					<strong>{targetWord}</strong> — {currentWordData.definition}
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

					<div class="action-buttons">
						<Button variant="secondary" size="sm" disabled class="product-button">
							Узнать о вкладах
						</Button>
						<Button variant="primary" size="sm" onclick={resetGame} class="play-again-button">
							🎯 Играть снова
						</Button>
					</div>
				</div>
			</div>
		{/if}

		{#if gameState === 'won'}
			<div class="victory-message">
				<Trophy class="text-gpb-gold neon-glow animate-pulse" size={48} />
				<h2 class="victory-text font-heading text-h3 text-gpb-black">
					Отлично!
				</h2>
				<p class="victory-subtitle font-body text-body text-gray-600">
					Слово угадано за {currentAttemptIndex + 1} попыт{currentAttemptIndex === 0 ? 'ку' : currentAttemptIndex < 4 ? 'ки' : 'ок'}
				</p>
			</div>
		{:else if gameState === 'lost'}
			<div class="defeat-message">
				<XCircle class="text-red-500 neon-glow animate-pulse" size={48} />
				<h2 class="defeat-text font-heading text-h3 text-gpb-black">
					Не получилось
				</h2>
				<p class="defeat-subtitle font-body text-body text-gray-600">
					Загаданное слово: <strong>{targetWord}</strong>
				</p>
			</div>
		{/if}

		{#if gameState === 'playing'}
			<div class="virtual-keyboard">
				{#each keyboardLayout as row}
					<div class="keyboard-row">
						{#each row as key}
							<button
								class="keyboard-key"
								class:keyboard-key-wide={key === 'ENTER' || key === '⌫'}
								class:keyboard-key-correct={keyStatuses[key] === 'correct'}
								class:keyboard-key-present={keyStatuses[key] === 'present'}
								class:keyboard-key-absent={keyStatuses[key] === 'absent'}
								onclick={() => handleKeyboardClick(key)}
								disabled={gameState !== 'playing'}
							>
								{#if key === 'ENTER'}
									ВВОД
								{:else if key === '⌫'}
									⌫
								{:else}
									{key}
								{/if}
							</button>
						{/each}
					</div>
				{/each}
			</div>
		{/if}

		<div class="keyboard-hint">
			<p class="font-body text-caption text-gray-500">
				{#if gameState === 'playing'}
					Используйте клавиатуру или кнопки на экране
				{:else}
					Игра завершена
				{/if}
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
		margin-bottom: 1rem;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(12px) saturate(180%);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 0.75rem;
	}


	.hint {
		color: rgba(255, 255, 255, 0.9);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.words-grid {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		margin-bottom: 1rem;
	}

	.word-row {
		display: flex;
		justify-content: center;
		gap: 0.25rem;
	}

	.word-row.submitted {
		pointer-events: none;
	}

	.word-row.submitted .letter-cell {
		animation: flipReveal 0.6s ease-in-out;
		animation-fill-mode: both;
	}

	.word-row.submitted .letter-cell:nth-child(1) { animation-delay: 0ms; }
	.word-row.submitted .letter-cell:nth-child(2) { animation-delay: 100ms; }
	.word-row.submitted .letter-cell:nth-child(3) { animation-delay: 200ms; }
	.word-row.submitted .letter-cell:nth-child(4) { animation-delay: 300ms; }
	.word-row.submitted .letter-cell:nth-child(5) { animation-delay: 400ms; }

	.word-row.winning {
		animation: wordWin 1s ease-out;
	}

	.letter-cell {
		width: calc(min(48px, (100vw - 4rem) / var(--word-length) - 0.25rem));
		height: calc(min(48px, (100vw - 4rem) / var(--word-length) - 0.25rem));
		max-width: 60px;
		max-height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.9);
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		font-family: var(--font-heading);
		font-size: clamp(1rem, 2.5vw, 1.25rem);
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
		background: var(--color-gpb-emerald);
		border-color: var(--color-gpb-emerald);
		color: white;
		font-weight: 700;
	}

	.letter-cell.present {
		background: var(--color-gpb-gold);
		border-color: var(--color-gpb-gold);
		color: black;
		font-weight: 600;
	}

	.letter-cell.absent {
		background: var(--color-gpb-gray-600);
		border-color: var(--color-gpb-gray-600);
		color: white;
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

	.action-buttons {
		display: flex;
		gap: 0.75rem;
		margin-top: 1rem;
	}






	.victory-message,
	.defeat-message {
		text-align: center;
		margin-bottom: 2rem;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		padding: 2rem;
		animation: victoryAppear 0.8s ease-out;
	}


	.victory-text,
	.defeat-text {
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		margin-bottom: 0.5rem;
	}

	.victory-subtitle,
	.defeat-subtitle {
		color: rgba(255, 255, 255, 0.9);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.virtual-keyboard {
		margin: 1rem 0 0.5rem 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.keyboard-row {
		display: flex;
		justify-content: center;
		gap: 0.25rem;
	}

	.keyboard-key {
		min-width: 30px;
		height: 42px;
		padding: 0 5px;
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 5px;
		font-family: var(--font-heading);
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-gpb-black);
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.keyboard-key:hover:not(:disabled) {
		background: rgba(255, 255, 255, 1);
		border-color: var(--color-gpb-violet);
		transform: translateY(-1px);
	}

	.keyboard-key:active:not(:disabled) {
		transform: translateY(0);
		background: rgba(255, 255, 255, 0.8);
	}

	.keyboard-key:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.keyboard-key-wide {
		min-width: 44px;
		font-size: 0.7rem;
	}

	.keyboard-key-correct {
		background: var(--color-gpb-emerald);
		border-color: var(--color-gpb-emerald);
		color: white;
	}

	.keyboard-key-present {
		background: var(--color-gpb-gold);
		border-color: var(--color-gpb-gold);
		color: black;
	}

	.keyboard-key-absent {
		background: var(--color-gpb-gray-600);
		border-color: var(--color-gpb-gray-600);
		color: white;
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

	@keyframes flipReveal {
		0% {
			transform: scaleY(1);
		}
		50% {
			transform: scaleY(0.1);
		}
		100% {
			transform: scaleY(1);
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
			width: calc(min(40px, (100vw - 3rem) / var(--word-length) - 0.25rem));
			height: calc(min(40px, (100vw - 3rem) / var(--word-length) - 0.25rem));
			font-size: clamp(0.875rem, 2vw, 1rem);
		}



		.keyboard-key {
			min-width: 28px;
			height: 42px;
			font-size: 0.75rem;
		}

		.keyboard-key-wide {
			min-width: 42px;
			font-size: 0.65rem;
		}

		.virtual-keyboard {
			margin: 1.5rem 0 0.75rem 0;
			gap: 0.375rem;
		}

		.keyboard-row {
			gap: 0.2rem;
		}
	}
</style>
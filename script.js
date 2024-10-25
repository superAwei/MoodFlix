const API_KEY = '392f3431bc009e57f5dc58f12e4949ee';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', () => {
    const moodForm = document.getElementById('mood-form');
    const moodTags = document.querySelectorAll('.mood-tag');
    const findMoviesButton = document.getElementById('find-movies');
    const movieRecommendations = document.getElementById('movie-recommendations');
    const moodDescription = document.getElementById('mood-description');
    const moodAnalysisResult = document.createElement('p');
    moodAnalysisResult.id = 'mood-analysis-result';
    moodForm.insertAdjacentElement('afterend', moodAnalysisResult);

    let selectedMood = '';
    let cachedMovies = {};

    moodTags.forEach(tag => {
        tag.addEventListener('click', async () => {
            selectMoodTag(tag.textContent);
            await showRecommendations(selectedMood);
        });
    });

    moodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMood = analyzeMood(moodDescription.value);
        selectMoodTag(userMood);
        await showRecommendations(userMood);
    });

    moodDescription.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const userMood = analyzeMood(moodDescription.value);
            selectMoodTag(userMood);
            await showRecommendations(userMood);
        }
    });

    function selectMoodTag(mood) {
        moodTags.forEach(tag => {
            if (tag.textContent === mood) {
                tag.classList.add('selected');
            } else {
                tag.classList.remove('selected');
            }
        });
        selectedMood = mood;
    }

    async function showRecommendations(mood) {
        movieRecommendations.innerHTML = '';
        const recommendations = await getMovieRecommendations(mood);
        displayMoodAnalysis(mood);
        displayMovieRecommendations(recommendations);
    }

    function displayMoodAnalysis(mood) {
        moodAnalysisResult.textContent = `根據你的描述，我們感受到了${mood}的情緒。因此，為你推薦以下電影：`;
    }

    function analyzeMood(description) {
        const moodKeywords = {
            '開心': ['開心', '快樂', '高興', '興奮', '喜悅', '愉快', '樂觀', '歡欣', '雀躍', '欣喜', '愉悅', '歡樂', '幸福', '滿足', '得意', '成功', '勝利', '達成', '實現', '完成', '突破', '進步', '成長', '收穫', '獲得', '贏得', '慶祝', '表揚', '讚美', '肯定', '認可', '欣賞', '感恩', '感謝', '感激', '知足', '舒心', '舒暢', '輕鬆', '自在', '自由', '解脫', '放鬆', '釋放', '解放', '暢快'],
            '悲傷': ['悲傷', '難過', '傷心', '沮喪', '失戀', '哭泣', '痛苦', '失望', '絕望', '消沉', '低落', '憂鬱', '憂傷', '憂愁', '哀傷', '哀痛', '悲痛', '悲哀', '悲慘', '悲涼', '悲觀', '失落', '失意', '失望', '失敗', '挫折', '打擊', '受傷', '傷害', '傷痛', '心碎', '心痛', '心傷', '心酸', '心寒', '心涼', '心灰意冷', '灰心', '喪氣', '氣餒', '洩氣', '頹廢', '頹喪', '頹唐', '萎靡', '消極', '無助', '無望', '無奈', '無力', '無能為力', '束手無策', '孤單', '孤獨', '寂寞', '空虛', '空洞', '空虛', '虛無', '虛度', '虛度光陰', '虛度年華', '虛度人生', '虛度此生', '虛度一生', '虛度青春', '虛度時光', '虛度歲月', '虛度時間', '虛度生命', '虛度生活', '虛度日子', '虛度年歲', '虛度年月', '虛度年華', '虛度光陰', '虛度時日', '虛度光陰', '虛度年華', '虛度此生', '虛度一生', '虛度青春', '虛度時光', '虛度歲月', '虛度時間', '虛度生命', '虛度生活', '虛度日子', '虛度年歲', '虛度年月', '虛度年華', '失業', '考試考差', '被家人罵', '被解雇', '被開除', '被辭退', '被炒魷魚', '被裁員', '被資遣', '被淘汰', '被淘汰出局'],
            '放鬆': ['放鬆', '平靜', '安寧', '舒適', '輕鬆', '悠閒', '愜意', '自在', '舒坦', '舒服', '舒心', '舒暢', '舒緩', '舒展', '舒適', '舒適自在', '舒適愜意', '舒適安逸', '舒適寧靜', '舒適恬靜', '舒適恬淡', '舒適恬適', '舒適恬逸', '舒適恬然', '舒適恬淡', '舒適恬靜', '舒適恬逸', '舒適恬然', '舒適恬淡', '舒適恬靜', '舒適恬逸', '舒適恬然', '舒適恬淡', '舒適恬靜', '舒適恬逸', '舒適恬然', '舒適恬淡', '舒適恬靜', '舒適恬逸', '舒適恬然', '舒適恬淡', '舒適恬靜', '舒適恬逸', '舒適恬然', '舒適恬淡', '舒適恬靜', '舒適恬逸', '舒適恬然'],
            '焦慮': ['焦慮', '緊張', '不安', '煩', '擔心', '恐懼', '害怕', '憂慮', '憂心', '憂慮', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚', '憂心忡忡', '憂心如焚'],
            '憤怒': ['憤怒', '生氣', '惱火', '火大', '暴躁', '發飆', '發火', '發怒', '發脾氣', '發飆', '發火', '發怒', '發脾氣', '發飆', '發火', '發怒', '發脾氣', '發飆', '發火', '發怒', '發脾氣', '發飆', '發火', '發怒', '發脾氣', '發飆', '發火', '發怒', '發脾氣', '發飆', '發火', '發怒', '發脾氣', '發飆', '發火', '發怒', '發脾氣', '發飆', '發火', '發怒', '發脾氣', '發飆', '發火', '發怒', '發脾氣', '發飆', '發火', '發怒', '發脾氣', '發飆', '失業', '考試考差', '被家人罵', '被解雇', '被開除', '被辭退', '被炒魷魚', '被裁員', '被資遣', '被淘汰', '被淘汰出局', '被淘汰出局', '被淘汰出局', '被淘汰出局', '被淘汰出局', '被淘汰出局', '被淘汰出局', '被淘汰出局', '被淘汰出局', '被淘汰出局'],
            '無聊': ['無聊', '乏味', '無趣', '枯燥', '單調', '無聊透頂', '無聊至極', '無聊透了', '無聊死了', '無聊透頂', '無聊至極', '無聊透了', '無聊死了', '無聊透頂', '無聊至極', '無聊透了', '無聊死了', '無聊透頂', '無聊至極', '無聊透了', '無聊死了', '無聊透頂', '無聊至極', '無聊透了', '無聊死了', '無聊透頂', '無聊至極', '無聊透了', '無聊死了', '無聊透頂', '無聊至極', '無聊透了', '無聊死了', '無聊透頂', '無聊至極', '無聊透了', '無聊死了', '無聊透頂', '無聊至極', '無聊透了', '無聊死了', '無聊透頂', '無聊至極', '無聊透了', '無聊死了', '無聊透頂', '無聊至極', '無聊透了', '無聊死了', '無聊透頂'],
            '孤獨': ['孤獨', '寂寞', '孤單', '獨處', '孤立', '孤獨寂寞', '孤獨無助', '孤獨無依', '孤獨無靠', '孤獨無援', '孤獨無助', '孤獨無依', '孤獨無靠', '孤獨無援', '孤獨無助', '孤獨無依', '孤獨無靠', '孤獨無援', '孤獨無助', '孤獨無依', '孤獨無靠', '孤獨無援', '孤獨無助', '孤獨無依', '孤獨無靠', '孤獨無援', '孤獨無助', '孤獨無依', '孤獨無靠', '孤獨無援', '孤獨無助', '孤獨無依', '孤獨無靠', '孤獨無援', '孤獨無助', '孤獨無依', '孤獨無靠', '孤獨無援', '孤獨無助', '孤獨無依', '孤獨無靠', '孤獨無援', '孤獨無助', '孤獨無依', '孤獨無靠', '孤獨無援', '孤獨無助', '孤獨無依', '孤獨無靠', '孤獨無援'],
            '浪漫': ['浪漫', '戀愛', '甜蜜', '溫馨', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調', '浪漫情懷', '浪漫情調'],
            '疲倦': ['疲倦', '累', '疲勞', '困倦', '疲憊', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪', '疲憊不已', '疲憊不堪'],
            '興奮': ['興奮', '激動', '亢奮', '熱血', '興高采烈', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃', '興致盎然', '興致勃勃'],
            '懷舊': ['懷舊', '回憶', '思念', '緬懷', '懷念', '懷念往事', '懷念過去', '懷念舊時', '懷念舊日', '懷念往事', '懷念過去', '懷念舊時', '懷念舊日', '懷念往事', '懷念過去', '懷念舊時', '懷念舊日', '懷念往事', '懷念過去', '懷念舊時', '懷念舊日', '懷念往事', '懷念過去', '懷念舊時', '懷念舊日', '懷念往事', '懷念過去', '懷念舊時', '懷念舊日', '懷念往事', '懷念過去', '懷念舊時', '懷念舊日', '懷念往事', '懷念過去', '懷念舊時', '懷念舊日', '懷念往事', '懷念過去', '懷念舊時', '懷念舊日', '懷念往事', '懷念過去', '懷念舊時', '懷念舊日', '懷念往事', '懷念過去', '懷念舊時', '懷念舊日', '懷念往事'],
            '驚恐': ['驚恐', '害怕', '驚嚇', '恐慌', '驚慌', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措', '驚慌無措', '驚慌失措'],
            '沮喪': ['沮喪', '失望', '消沉', '低落', '沮喪失望', '沮喪消沉', '沮喪低落', '沮喪失望', '沮喪消沉', '沮喪低落', '沮喪失望', '沮喪消沉', '沮喪低落', '沮喪失望', '沮喪消沉', '沮喪低落', '沮喪失望', '沮喪消沉', '沮喪低落', '沮喪失望', '沮喪消沉', '沮喪低落', '沮喪失望', '沮喪消沉', '沮喪低落', '沮喪失望', '沮喪消沉', '沮喪低落', '沮喪失望', '沮喪消沉', '沮喪低落', '沮喪失望', '沮喪消沉', '沮喪低落', '沮喪失望', '沮喪消沉', '沮喪低落', '沮喪失望', '沮喪消沉', '沮喪低落', '沮喪失望', '沮喪消沉', '沮喪低落', '沮喪失望', '沮喪消沉', '沮喪低落', '沮喪失望', '沮喪消沉', '沮喪低落', '沮喪失望'],
            '平靜': ['平靜', '安詳', '祥和', '淡定', '平和', '平和安寧', '平和安詳', '平和祥和', '平和淡定', '平和安寧', '平和安詳', '平和祥和', '平和淡定', '平和安寧', '平和安詳', '平和祥和', '平和淡定', '平和安寧', '平和安詳', '平和祥和', '平和淡定', '平和安寧', '平和安詳', '平和祥和', '平和淡定', '平和安寧', '平和安詳', '平和祥和', '平和淡定', '平和安寧', '平和安詳', '平和祥和', '平和淡定', '平和安寧', '平和安詳', '平和祥和', '平和淡定', '平和安寧', '平和安詳', '平和祥和', '平和淡定', '平和安寧', '平和安詳', '平和祥和', '平和淡定', '平和安寧', '平和安詳', '平和祥和', '平和淡定', '平和安寧']
        };

        const lowerDescription = description.toLowerCase();
        const detectedMoods = [];

        for (const [mood, keywords] of Object.entries(moodKeywords)) {
            if (keywords.some(keyword => lowerDescription.includes(keyword))) {
                detectedMoods.push(mood);
            }
        }

        if (detectedMoods.length === 0) {
            return '開心'; // 默認心情
        } else if (detectedMoods.length === 1) {
            return detectedMoods[0];
        } else {
            // 如果檢測到多種情緒，隨機選擇一種
            return detectedMoods[Math.floor(Math.random() * detectedMoods.length)];
        }
    }

    async function getMovieRecommendations(mood) {
        if (cachedMovies[mood]) {
            return cachedMovies[mood];
        }

        const genreId = getMoodGenre(mood);
        const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&language=zh-TW`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            const movies = data.results.slice(0, 10);
            cachedMovies[mood] = movies;
            return movies;
        } catch (error) {
            console.error('Error fetching movie recommendations:', error);
            return [];
        }
    }

    function getMoodGenre(mood) {
        const moodGenreMap = {
            '開心': 35, // 喜劇
            '悲傷': 18, // 劇情
            '興奮': 28, // 動作
            '放鬆': 10749, // 愛情
            '孤獨': 99, // 紀錄片
            '浪漫': 10749, // 愛情
            '疲倦': 36, // 歷史
            '無聊': 12, // 冒險
            '焦慮': 53, // 驚悚
            '憤怒': 28, // 動作
            '懷舊': 36, // 歷史
            '驚恐': 27, // 恐怖
            '沮喪': 18, // 劇情
            '平靜': 99, // 紀錄片
        };
        return moodGenreMap[mood] || 18; // 默認返回劇情片
    }

    function displayMovieRecommendations(movies) {
        movieRecommendations.innerHTML = '';
        if (movies.length === 0) {
            movieRecommendations.innerHTML = '<p>抱歉，沒有找到相關電影推薦。</p>';
            return;
        }
        movies.forEach((movie, index) => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.innerHTML = `
                <img src="${IMG_BASE_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-rating">★ ${movie.vote_average.toFixed(1)}</p>
                    <p class="movie-overview">${movie.overview}</p>
                </div>
            `;
            movieCard.addEventListener('click', () => {
                window.open(`https://www.themoviedb.org/movie/${movie.id}`, '_blank');
            });
            movieRecommendations.appendChild(movieCard);

            setTimeout(() => {
                movieCard.classList.add('show');
            }, index * 100);
        });
    }
});

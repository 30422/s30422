let contents = [];
let currentType = 'novels'; // 기본은 소설

const urls = {
  novels: 'https://raw.githubusercontent.com/30422/s30422/main/%EC%86%8C%EC%84%A4%20%EB%AA%A9%EB%A1%9D',
  webtoons: 'https://raw.githubusercontent.com/30422/s30422/main/%EC%9B%B9%ED%88%B0%20%EB%AA%A9%EB%A1%9D'
};

window.onload = () => {
  document.querySelectorAll('input[name="contentType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentType = e.target.value;
      loadData(currentType);
    });
  });

  document.getElementById('recommendBtn').onclick = recommendContent;
  document.getElementById('copyBtn').onclick = copyResultToClipboard;

  loadData(currentType); // 최초 로딩
};

function loadData(type) {
  const url = urls[type];
  document.getElementById('genreCheckboxes').textContent = '목록 불러오는 중...';
  document.getElementById('recommendBtn').disabled = true;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('파일 불러오기 실패');
      return res.text();
    })
    .then(text => {
      contents = parseText(text);
      createGenreCheckboxes();
      document.getElementById('recommendBtn').disabled = false;
    })
    .catch(err => {
      document.getElementById('genreCheckboxes').textContent = '목록 불러오기 실패';
      console.error(err);
    });
}

function parseText(text) {
  return text
    .trim()
    .split('\n')
    .map(line => {
      const [title, genreStr, summary] = line.split('|').map(s => s.trim());
      const genres = genreStr ? genreStr.split(',').map(g => g.trim()) : [];
      return { title, genres, summary };
    });
}

function createGenreCheckboxes() {
  const genreSet = new Set();
  contents.forEach(item => {
    item.genres.forEach(genre => genreSet.add(genre));
  });

  const genres = Array.from(genreSet).sort();
  const container = document.getElementById('genreCheckboxes');
  container.innerHTML = '';

  genres.forEach(genre => {
    const label = document.createElement('label');
    label.className = 'genre-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = genre;

    const span = document.createElement('span');
    span.textContent = genre;

    label.appendChild(checkbox);
    label.appendChild(span);
    container.appendChild(label);
  });
}

function recommendContent() {
  const checkedGenres = [...document.querySelectorAll('#genreCheckboxes input[type="checkbox"]:checked')]
    .map(cb => cb.value);

  if (checkedGenres.length === 0) {
    showResult('장르를 최소 하나 이상 선택하세요.');
    return;
  }

  const filtered = contents.filter(item =>
    checkedGenres.every(g => item.genres.includes(g))
  );

  if (filtered.length === 0) {
    showResult(`선택한 장르에 해당하는 ${currentType === 'novels' ? '소설' : '웹툰'}이 없습니다.`);
    return;
  }

  const randomItem = filtered[Math.floor(Math.random() * filtered.length)];

  showResult(
    `장르: ${randomItem.genres.join(', ')}\n` +
    `제목: ${randomItem.title}\n` +
    `줄거리: ${randomItem.summary}`
  );
}

function showResult(text) {
  const resultDiv = document.getElementById('result');
  const copyBtn = document.getElementById('copyBtn');

  resultDiv.classList.remove('result-highlight', 'result-error');

  let bgColorClass = 'result-highlight';
  if (text.includes('없습니다') || text.includes('선택')) {
    bgColorClass = 'result-error';
  }

  resultDiv.style.opacity = 0;
  setTimeout(() => {
    resultDiv.textContent = text;
    resultDiv.style.opacity = 1;
    resultDiv.classList.add(bgColorClass);
    copyBtn.style.display = 'inline-block';
  }, 200);
}

function copyResultToClipboard() {
  const resultText = document.getElementById('result').textContent;
  if (!resultText) return;

  const lines = resultText.split('\n');
  const titleLine = lines.find(line => line.startsWith('제목:'));
  const textToCopy = titleLine ? titleLine.replace(/^제목:\s*/, '') : resultText;

  navigator.clipboard.writeText(textToCopy)
    .then(() => alert('제목이 복사되었습니다!'))
    .catch(() => alert('복사 실패. 직접 복사해 주세요.'));
}

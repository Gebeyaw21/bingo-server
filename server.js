<!DOCTYPE html>
<html lang="am">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>አፍሮ ቢንጎ</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>.marked { background-color: #10b981 !important; color: white; }</style>
</head>
<body class="bg-slate-900 text-white font-sans p-4 max-w-md mx-auto space-y-4">

    <!-- Header -->
    <div class="flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700">
        <div>
            <h1 class="font-bold text-amber-500 text-lg">ስማርት ቢንጎ</h1>
            <p class="text-xs text-gray-400">ተጫዋቾች፦ <span id="player-count" class="text-green-400 font-bold">1</span></p>
        </div>
        <div class="text-right bg-slate-700 px-3 py-1 rounded-lg">
            <span class="text-xs text-gray-300 block">Prize Pool</span>
            <span class="text-sm font-bold text-green-400">100 ETB</span>
        </div>
    </div>

    <!-- Telebirr Verification -->
    <div id="buy-section" class="bg-slate-800 p-3 rounded-xl border border-amber-500/30 space-y-2 text-xs">
        <p class="font-bold text-amber-400">📌 ክፍያ፦ በቴሌብር ወደ <b class="text-amber-300">0995445844</b> (10 ETB) ይላኩ</p>
        <textarea id="sms-input" rows="2" placeholder="ከቴሌብር የደረሰዎትን SMS እዚህ Paste ያድርጉ..." class="w-full bg-slate-700 p-2 rounded border border-slate-600 focus:outline-none"></textarea>
        <button onclick="verifySMS()" class="w-full bg-green-600 hover:bg-green-700 font-bold py-2 rounded text-white">ክፍያውን አረጋግጥ</button>
    </div>

    <!-- Call Number Display -->
    <div class="bg-purple-900 border-2 border-purple-500 rounded-xl p-3 text-center">
        <span class="text-xs text-purple-300 uppercase">የተጠራው ቁጥር</span>
        <div id="current-call" class="text-4xl font-black text-amber-400">--</div>
    </div>

    <!-- Cartela Grid -->
    <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
        <div class="flex justify-between items-center mb-2 text-xs font-semibold text-amber-400">
            <span>ካርቴላ</span>
            <button onclick="generateCartela()" class="bg-slate-700 px-2 py-1 rounded">ቀይር</button>
        </div>
        <div class="grid grid-cols-5 gap-1 text-center font-bold text-xs mb-1">
            <div class="bg-amber-500 text-slate-900 py-1 rounded">B</div>
            <div class="bg-amber-500 text-slate-900 py-1 rounded">I</div>
            <div class="bg-amber-500 text-slate-900 py-1 rounded">N</div>
            <div class="bg-amber-500 text-slate-900 py-1 rounded">G</div>
            <div class="bg-amber-500 text-slate-900 py-1 rounded">O</div>
        </div>
        <div id="cartela-grid" class="grid grid-cols-5 gap-1 text-center text-sm"></div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-2">
        <button onclick="socket.emit('startGame')" class="w-1/2 bg-amber-500 text-slate-950 font-bold py-3 rounded-xl">ጨዋታ ጀምር</button>
        <button onclick="checkBingo()" class="w-1/2 bg-green-600 text-white font-bold py-3 rounded-xl">BINGO!</button>
    </div>

    <script>
        const socket = io('https://bingo-server-9kkr.onrender.com');

        socket.on('playerCountUpdate', count => document.getElementById('player-count').innerText = count);
        socket.on('numberCalled', data => {
            let n = data.number;
            let l = (n <= 15)?'B':(n <= 30)?'I':(n <= 45)?'N':(n <= 60)?'G':'O';
            document.getElementById('current-call').innerText = `${l}-${n}`;
        });
        socket.on('winnerFound', d => alert(`🎉 BINGO! አሸናፊ፦ ${d.winner}`));

        async function verifySMS() {
            const sms = document.getElementById('sms-input').value.trim();
            if(!sms) return alert("እባክዎ SMS ያስገቡ!");
            
            const res = await fetch('https://bingo-server-9kkr.onrender.com/api/verify-sms', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ message: sms })
            });
            const data = await res.json();
            alert(data.message);
            if(data.success) document.getElementById('buy-section').style.display = 'none';
        }

        function generateCartela() {
            const grid = document.getElementById('cartela-grid');
            grid.innerHTML = '';
            const ranges = [[1, 15], [16, 30], [31, 45], [46, 60], [61, 75]];
            let cols = ranges.map(r => {
                let nums = [];
                while(nums.length < 5) {
                    let n = Math.floor(Math.random() * (r[1]-r[0]+1)) + r[0];
                    if(!nums.includes(n)) nums.push(n);
                }
                return nums;
            });

            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    const btn = document.createElement('div');
                    btn.className = 'bg-slate-700 p-2.5 rounded font-bold cursor-pointer';
                    if (r === 2 && c === 2) {
                        btn.innerText = '★';
                        btn.classList.add('marked');
                    } else {
                        btn.innerText = cols[c][r];
                        btn.onclick = () => btn.classList.toggle('marked');
                    }
                    grid.appendChild(btn);
                }
            }
        }
        generateCartela();
    </script>
</body>
</html>

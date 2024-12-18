const translations = {
            fr: {
                title: "Convertisseur - TAS Editor",
                chooseFileText: "Choisir un fichier local",
                fileNameLabel: "Nom du fichier :",
                processButton: "Traiter le fichier",
                downloadText: "Télécharger le fichier nettoyé",
                scriptTitle: "Script Fonctionnel",
                langButton: "Changer de langue"
            },
            en: {
                title: "Converter - TAS Editor",
                chooseFileText: "Choose a local file",
                fileNameLabel: "File name:",
                processButton: "Process the file",
                downloadText: "Download the cleaned file",
                scriptTitle: "Functional Script",
                langButton: "Change language"
            }
        };

        let currentLang = 'fr';

        function changeLanguage() {
            currentLang = currentLang === 'fr' ? 'en' : 'fr';
            updateLanguage();
        }

        function updateLanguage() {
            document.getElementById('title').textContent = translations[currentLang].title;
            document.getElementById('chooseFileText').textContent = translations[currentLang].chooseFileText;
            document.getElementById('fileNameLabel').textContent = translations[currentLang].fileNameLabel;
            document.getElementById('processButton').textContent = translations[currentLang].processButton;
            document.getElementById('downloadLink').textContent = translations[currentLang].downloadText;
            document.getElementById('scriptTitle').textContent = translations[currentLang].scriptTitle;
            document.getElementById('langButton').textContent = translations[currentLang].langButton;
        }

        document.getElementById('langButton').addEventListener('click', changeLanguage);

        const fileInput = document.getElementById('fileInput');
        const fileInfo = document.getElementById('fileInfo');
        const lineCount = document.getElementById('lineCount');
        const processButton = document.getElementById('processButton');
        const progressBar = document.getElementById('progressBar');
        const progressBarInner = document.getElementById('progressBarInner');
        const downloadLink = document.getElementById('downloadLink');
        const fileNameInput = document.getElementById('fileNameInput');

        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (file) {
                const fileSize = (file.size / 1024).toFixed(2);
                fileInfo.textContent = `Fichier sélectionné : ${file.name} (${fileSize} Ko)`;
                fileInfo.style.display = 'block';

                const reader = new FileReader();
                reader.onload = function (event) {
                    const content = event.target.result;
                    const lines = content.split('\n').length;
                    lineCount.textContent = `Nombre de lignes : ${lines}`;
                    lineCount.style.display = 'block';
                };
                reader.readAsText(file);
            } else {
                fileInfo.textContent = 'Aucun fichier sélectionné.';
                fileInfo.style.display = 'none';
                lineCount.style.display = 'none';
            }
        });

        processButton.addEventListener('click', () => {
            if (!fileInput.files.length) {
                alert('Veuillez sélectionner un fichier !');
                return;
            }

            progressBar.style.display = 'block';
            progressBarInner.style.width = '0%';
            progressBarInner.textContent = '0%';

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onloadstart = function () {
                progressBarInner.style.width = '10%';
                progressBarInner.textContent = '10%';
            };

            reader.onload = function (event) {
                const content = event.target.result;
                const cleanedContent = content.replace(/KEY_SL;?/g, '').replace(/KEY_SR;?/g, '');
                const fileName = fileNameInput.value.trim() || 'script0-1';
                const blob = new Blob([cleanedContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);

                downloadLink.href = url;
                downloadLink.download = `${fileName}.txt`;
                downloadLink.style.display = 'inline';

                progressBarInner.style.width = '100%';
                progressBarInner.textContent = '100%';
            };

            reader.onprogress = function (event) {
                if (event.lengthComputable) {
                    const percentLoaded = Math.round((event.loaded / event.total) * 100);
                    progressBarInner.style.width = percentLoaded + '%';
                    progressBarInner.textContent = percentLoaded + '%';
                }
            };

            reader.readAsText(file);
        });

        async function fetchGitHubFiles() {
            const githubURL = "https://api.github.com/repos/echecetdamesr/BOTW-Tool-Assisted-Speedrun-Helper/contents/programmes";

            try {
                const response = await fetch(githubURL);
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des fichiers depuis GitHub');
                }

                const files = await response.json();
                const txtFiles = files.filter(file => file.name.endsWith('.txt'));
                displayFiles(txtFiles);
            } catch (error) {
                console.error(error);
                document.getElementById('fileTable').innerHTML = '<tr><td colspan="7">Impossible de charger les fichiers depuis GitHub</td></tr>';
            }
        }

        function extractFileDetails(fileName) {
            const nameParts = fileName.split('-');

            if (nameParts.length === 5) {
                return {
                    pseudo: nameParts[0],
                    segment: nameParts[1],
                    temps: nameParts[2],
                    information: nameParts[3]
                };
            }

            return {};
        }

        function displayFiles(files) {
            const tableBody = document.getElementById('fileTable').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = '';

            files.forEach(file => {
                const row = document.createElement('tr');

                const nameCell = document.createElement('td');
                nameCell.textContent = file.name;

                const details = extractFileDetails(file.name);
                const pseudoCell = document.createElement('td');
                const segmentCell = document.createElement('td');
                const tempsCell = document.createElement('td');
                const infoCell = document.createElement('td');

                pseudoCell.textContent = details.pseudo || '';
                segmentCell.textContent = details.segment || '';
                tempsCell.textContent = details.temps || '';
                infoCell.textContent = details.information || '';

                const poidsCell = document.createElement('td');
                const poids = (file.size / 1024).toFixed(2);
                poidsCell.textContent = poids;

                const downloadCell = document.createElement('td');
                const downloadButton = document.createElement('a');
                const rawUrl = `https://raw.githubusercontent.com/echecetdamesr/BOTW-Tool-Assisted-Speedrun-Helper/main/programmes/${file.name}`;
                downloadButton.href = rawUrl;
                downloadButton.target = '_blank';
                downloadButton.textContent = 'Télécharger';
                downloadButton.classList.add('download-button');
                downloadCell.appendChild(downloadButton);

                row.append(nameCell, pseudoCell, segmentCell, tempsCell, infoCell, poidsCell, downloadCell);
                tableBody.appendChild(row);
            });
        }

        fetchGitHubFiles();

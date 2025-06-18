import { MapManager } from './map.js';

class App {
    constructor() {
        this.mapManager = new MapManager('map-container');
        this.currentPoint = null;
        this.currentPhotoIndex = 0;
        
        this.elements = {
            infoPanel: document.getElementById('info-panel'),
            closePanelBtn: document.getElementById('close-panel'),
            pointTitle: document.getElementById('point-title'),
            pointCoords: document.getElementById('point-coords'),
            pointDescription: document.getElementById('point-description'),
            currentPhoto: document.getElementById('current-photo'),
            prevPhotoBtn: document.getElementById('prev-photo'),
            nextPhotoBtn: document.getElementById('next-photo'),
            photoCounter: document.querySelector('.photo-counter'),
            addPointBtn: document.getElementById('add-point'),
            clearPointsBtn: document.getElementById('clear-points'),
            pointCounter: document.getElementById('point-counter')
        };
        
        this.init();
        this.initMarquee();
    }

    async init() {
        await this.mapManager.init();
        
        // Переопределяем обработчик клика на точке
        this.mapManager.onPointClick = (pointData) => this.showPointInfo(pointData);
        
        // Загружаем точки из JSON
        const count = await this.mapManager.loadPointsFromJSON('data/points.json');
        this.elements.pointCounter.textContent = `Точек на карте: ${count}`;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.elements.closePanelBtn.addEventListener('click', () => {
            this.closeInfoPanel();
        });
        
        this.elements.prevPhotoBtn.addEventListener('click', () => {
            this.showPrevPhoto();
        });
        
        this.elements.nextPhotoBtn.addEventListener('click', () => {
            this.showNextPhoto();
        });
        
        this.elements.addPointBtn.addEventListener('click', () => {
            this.addRandomPoint();
        });
        
        this.elements.clearPointsBtn.addEventListener('click', () => {
            this.clearAllPoints();
        });
    }

    showPointInfo(pointData) {
        this.currentPoint = pointData;
        this.currentPhotoIndex = 0;
        
        // Обновляем информацию в панели
        this.elements.pointTitle.textContent = pointData.title;
        this.elements.pointCoords.textContent = pointData.coords.join(', ');
        
        // Обрабатываем переносы строк в описании
        const description = pointData.description || '';
        this.elements.pointDescription.innerHTML = description
            .replace(/\n/g, '<br>') // Заменяем \n на <br>
            .replace(/\\n/g, '<br>'); // На случай, если есть экранированные символы
        
        // Показываем первую фотографию
        this.updatePhoto();
        
        // Открываем панель
        this.elements.infoPanel.classList.add('active');
        
        // Уменьшаем ширину карты
        document.getElementById('map-container').style.width = 'calc(100% - 500px)';
    }

    initMarquee() {
        const marqueeContent = document.querySelector('.marquee-content');
        
        // Получаем все фотографии из папки points
        const allPhotos = [
            'images/points/point1-1.jpg',
            'images/points/point2-1.jpg',
            'images/points/point3-1.jpg',
            'images/points/point3-2.jpg',
            'images/points/point4-1.jpg',
            'images/points/point5-1.jpg',
            'images/points/point5-2.jpg',
            'images/points/point6-1.jpg',
            'images/points/point6-2.jpg',
            'images/points/point7-1.jpg',
            'images/points/point8-1.jpg',
            'images/points/point8-2.jpg',
            'images/points/point9-1.jpg',
            'images/points/point10-1.jpg',
            'images/points/point10-2.jpg',
            'images/points/point11-1.jpg',
            'images/points/point11-2.jpg',
            'images/points/point12-1.jpg',
            'images/points/point13-1.jpg',
            'images/points/point14-1.jpg',
            'images/points/point15-1.jpg',
            'images/points/point16-1.jpg',
            'images/points/point17-1.jpg'
        ];

        // Проверяем, что массив не пустой
        if (allPhotos.length === 0) {
            console.error('Нет фотографий в папке points!');
            allPhotos.push('images/default-photo.jpg'); // Заглушка
        }

        // Создаём элементы бегущей строки
        const marqueeItems = [];
        allPhotos.forEach(photo => {
            const photoItem = document.createElement('div');
            photoItem.className = 'marquee-item';
            
            // Проверяем существование фото перед добавлением
            const img = new Image();
            img.src = photo;
            img.onerror = () => {
                // Если фото не загружается, используем заглушку
                photoItem.innerHTML = `
                    <img src="images/default-photo.jpg" class="marquee-photo" alt="Фото точки">
                    <div class="marquee-separator">→</div>
                `;
            };
            img.onload = () => {
                photoItem.innerHTML = `
                    <img src="${photo}" class="marquee-photo" alt="Фото точки">
                    <div class="marquee-separator">→</div>
                `;
            };
            
            marqueeItems.push(photoItem);
        });

        // Клонируем элементы для бесшовной анимации
        const clonedItems = marqueeItems.map(item => item.cloneNode(true));
        
        // Очищаем содержимое перед добавлением
        marqueeContent.innerHTML = '';

        // Создаём два набора элементов для бесшовной анимации
        for (let i = 0; i < 2; i++) {
            allPhotos.forEach(photo => {
                const photoItem = document.createElement('div');
                photoItem.className = 'marquee-item';
                photoItem.innerHTML = `
                    <img src="${photo}" class="marquee-photo" alt="Фото точки">
                    <img src="images/relay-icon.png" class="marquee-separator">
                `;
                marqueeContent.appendChild(photoItem);
            });
        }

        // Запускаем анимацию
        marqueeContent.style.animation = `marquee ${50 + allPhotos.length * 2}s linear infinite`;
    }


    updatePhoto() {
        if (this.currentPoint && this.currentPoint.photos.length > 0) {
            const photo = this.currentPoint.photos[this.currentPhotoIndex];
            this.elements.currentPhoto.src = photo;
            this.elements.photoCounter.textContent = `${this.currentPhotoIndex + 1}/${this.currentPoint.photos.length}`;
            
            // Показываем/скрываем кнопки навигации
            this.elements.prevPhotoBtn.style.display = this.currentPhotoIndex > 0 ? 'flex' : 'none';
            this.elements.nextPhotoBtn.style.display = this.currentPhotoIndex < this.currentPoint.photos.length - 1 ? 'flex' : 'none';
        }
    }

    showPrevPhoto() {
        if (this.currentPhotoIndex > 0) {
            this.currentPhotoIndex--;
            this.updatePhoto();
        }
    }

    showNextPhoto() {
        if (this.currentPhotoIndex < this.currentPoint.photos.length - 1) {
            this.currentPhotoIndex++;
            this.updatePhoto();
        }
    }

    closeInfoPanel() {
        this.elements.infoPanel.classList.remove('active');
    document.getElementById('map-container').style.width = '100%';
    }

    async addRandomPoint() {
        const bounds = this.mapManager.map.getBounds();
        const lat = Math.random() * (bounds[1][0] - bounds[0][0]) + bounds[0][0];
        const lon = Math.random() * (bounds[1][1] - bounds[0][1]) + bounds[0][1];
        
        const newPoint = {
            coords: [lat, lon],
            title: `Новая точка ${this.mapManager.getPointsCount() + 1}`,
            description: 'Описание новой точки',
            photos: [
                'images/points/default.jpg'
            ]
        };
        
        this.mapManager.addPoint(newPoint);
        this.elements.pointCounter.textContent = `Точек на карте: ${this.mapManager.getPointsCount()}`;
    }

    clearAllPoints() {
        this.mapManager.clearAllPoints();
        this.closeInfoPanel();
        this.elements.pointCounter.textContent = `Точек на карте: 0`;
    }
}

new App();
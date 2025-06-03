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
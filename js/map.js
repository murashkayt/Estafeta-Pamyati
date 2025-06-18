// Границы Москвы и Московской области (примерные координаты)
const MOSCOW_REGION_BOUNDS = [
    [54.5, 35.5], // Юго-западная точка
    [56.5, 38.5]  // Северо-восточная точка
];

export class MapManager {
    constructor(mapId) {
        this.mapId = mapId;
        this.map = null;
        this.placemarks = [];
        this.pointsCollection = null;
        
        this.customIcon = {
            iconLayout: 'default#image',
            iconImageHref: 'images/markers/custom-marker.png',
            iconImageSize: [40, 40],
            iconImageOffset: [-20, -20]
        };
    }
    

    async init() {
        return new Promise((resolve) => {
            ymaps.ready(() => {
                try {
                    this.map = new ymaps.Map(this.mapId, {
                        center: [55.754020, 37.620366], // Центр Москвы
                        zoom: 10,
                        // Устанавливаем ограничения
                        restrictMapArea: MOSCOW_REGION_BOUNDS
                    });

                    // Настраиваем поведение карты
                    this.configureControls();
                    
                    // Инициализация коллекции точек
                    this.pointsCollection = new ymaps.GeoObjectCollection();
                    this.map.geoObjects.add(this.pointsCollection);
    
                    // Ограничиваем минимальный и максимальный zoom
                    this.map.setBounds(MOSCOW_REGION_BOUNDS, {
                        checkZoomRange: true
                    }).then(() => {
                        this.map.options.set('minZoom', 7);
                        this.map.options.set('maxZoom', 14);
                    });
    
                    resolve();
                } catch (e) {
                    console.error('Ошибка инициализации карты:', e);
                }
            });
        });
    }
    
    configureControls() {
        // Удаляем ненужные элементы
        const controlsToRemove = [
            'searchControl',
            'trafficControl',
            'typeSelector',
            'fullscreenControl',
            'rulerControl',
            'geolocationControl',
            'copyrights' // Не рекомендуется удалять
        ];
        
        controlsToRemove.forEach(control => {
            this.map.controls.remove(control);
        });
    
        // Добавляем только кнопки масштаба
        this.map.controls.add('zoomControl', {
            position: { right: 10, top: 100 },
            size: 'small'
        });
        

    }
    addPoint(pointData) {
        const placemark = new ymaps.Placemark(pointData.coords, {
            balloonContent: pointData.title,
            pointData: pointData // Сохраняем все данные точки в свойствах метки
        }, {
            iconLayout: this.customIcon.iconLayout,
            iconImageHref: this.customIcon.iconImageHref,
            iconImageSize: this.customIcon.iconImageSize,
            iconImageOffset: this.customIcon.iconImageOffset
        });

        // Добавляем обработчик клика
        placemark.events.add('click', (e) => {
            const target = e.get('target');
            const pointData = target.properties.get('pointData');
            if (this.onPointClick) {
                this.onPointClick(pointData); // Важно: проверяем наличие обработчика
            }
        });

        this.placemarks.push(placemark);
        this.pointsCollection.add(placemark);

        return placemark;
    }

    onPointClick(pointData) {
        // Этот метод будет переопределён в App
    }

    clearAllPoints() {
        this.pointsCollection.removeAll();
        this.placemarks = [];
    }

    getPointsCount() {
        return this.placemarks.length;
    }

    async loadPointsFromJSON(url) {
        const response = await fetch(url);
        const points = await response.json();
        
        points.forEach(point => {
            this.addPoint(point);
        });
        
        return points.length;
    }
}
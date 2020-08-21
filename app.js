/* Sidebar functionality */
function openFilter() {
    document.getElementById('sideFilter').style.width = '250px';
    document.getElementById('sideFilter').style.padding = '40px';
}

function closeFilter() {
    document.getElementById('sideFilter').style.padding = '0';
    document.getElementById('sideFilter').style.width = '0';
}

/* Mapbox setup */
function loadMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYmF5bGVlZHN3ZW5zb24iLCJhIjoiY2pla2JuYjZ1MTR1dTJybnU5MXI1eWdmYSJ9.H2Uyr-spXxDwqlhssrP3Lw';
    var map = new mapboxgl.Map({
        container: 'earthquakeMap',
        style: 'mapbox://styles/bayleedswenson/ckdkinfaq16ma1jndribdc8so',
        center: [-100.403732, 40.492392],
        zoom: 3
    });

    map.on('load', function() {
        // Get earthquake api data
        let queryString = '';
        const elements = document.getElementsByTagName('input');
        const minmagnitude = document.getElementById('minmagnitude').value;
        const maxmagnitude = document.getElementById('maxmagnitude').value;

        for(let i = 0; i <= elements.length; i++) {
            if (elements[i] && elements[i].checked && elements[i].value !== 'none') {
                queryString += `&${elements[i].name}=${elements[i].value}`;
            }
        }
        if (minmagnitude !== 'none') {
            queryString += `&minmagnitude=${minmagnitude}`;
        }
        if (maxmagnitude !== 'none') {
            queryString += `&maxmagnitude=${maxmagnitude}`;
        }
        fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson${queryString}`).then((data) => {
            document.getElementById('loadingIcon').style.display = 'block';
            data.json().then((points) => {
                setMapPoints(points);
                document.getElementById('loadingIcon').style.display = 'none';
            });
        }).catch((error) => {
            alert(error);
        });
    });
    
    function setMapPoints(points) {
        map.addSource('earthquakes', {
            'type': 'geojson',
            'data': points
            }
        )
    
        map.addLayer({
            'id': 'earthquakePoints',
            'type': 'circle',
            'source': 'earthquakes',
            'paint': {
                'circle-radius': 6,
                'circle-color': '#FF0063'
            }
        })
    }
    
    map.on('click', function(e) {
        var features = map.queryRenderedFeatures(e.point, {
          layers: ['earthquakePoints'] // replace this with the name of the layer
        });
      
        if (!features.length) {
          return;
        }
      
        var feature = features[0];
    
        const time = new Date(feature.properties.time);
        const alert = feature.properties.alert[0].toUpperCase() + feature.properties.alert.substring(1);

        var popup = new mapboxgl.Popup({ offset: [0, -15] })
          .setLngLat(feature.geometry.coordinates)
          .setHTML(`
                <ul>
                    <li>Magnitude: ${feature.properties.mag}</li>
                    <li>Place: ${feature.properties.place}</li>
                    <li>Time: ${time}</li>
                    <li>Alert Level: ${alert}</li>
                </ul>
            `)
          .addTo(map);
    });
}

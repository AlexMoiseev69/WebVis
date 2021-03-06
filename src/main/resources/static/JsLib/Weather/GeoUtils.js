/**
 * Created by user on 10.03.2017.
 */
function getXYZ(lat, lon) {
    // lat+=90;
    // lon=180-lon;
    var Lat   = (lat)*(Math.PI/180);
    var Long  = (lon)*(Math.PI/180);

    var x = (Math.cos(Long) * Math.cos(Lat));
    var y = (Math.sin(Lat));
    var z = (Math.sin(Long) * Math.cos(Lat));

    return new THREE.Vector3(x,y,z);
}

function distance(x1, y1, z1, x2, y2, z2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) + (z2 - z1) * (z2 - z1));
}

function TileToGeo(i, j) {
    var lat = j * 180 + 90;
    var lon = i * 360;
    return new THREE.Vector2(lat, lon);
}


function TileToWorldPos(x, y)
{
    var lon, lat;

    var n = Math.PI - 2.0 * Math.PI * y;

    lon = (x * 360.0);
    lat = 180.0 / Math.PI * Math.atan(Math.sinh(n));

    return new THREE.Vector2(lon, lat);
}

function DecarToSphere(v3)
{
    // var normal = new THREE.Vector3(v3.x, v3.y, v3.z);
    // normal = normal.normalize();
    // var lon, lat;
    // lon = Math.atan(normal.x/normal.z);
    // lat = Math.asin(normal.y);
    var radius = distance(v3.x, 0, v3.y, 0, v3.z, 0);
    var lon = Math.atan2(v3.x, v3.z);
    var lat = Math.asin(v3.y / radius);

    return new THREE.Vector2(lon, lat);
}
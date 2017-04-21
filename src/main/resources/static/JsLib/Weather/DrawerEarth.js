/**
 * Created by user on 10.03.2017.
 */

//"http://b.tile.openstreetmap.org/"
function Planet(radius, currentZoom, mapSource) {
    this.radius = radius;
    this.zoom = currentZoom;

    this.mapSource = mapSource;

    this.getMesh = function () {
        var horizontal = Math.pow(2, this.zoom), vertical=Math.pow(2, this.zoom);
        var geometry   = new THREE.SphereGeometry(this.radius, horizontal, vertical);

        var materials = [];
        for(var j=0;j<vertical;j++)
            for(var i=0;i<horizontal;i++){
                THREE.ImageUtils.crossOrigin = '';
                var texture = THREE.ImageUtils.loadTexture(this.tileUrl+"/"+this.zoom+"/"+i+"/"+j+".png");
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set( horizontal, vertical );
                var material1 = new THREE.MeshBasicMaterial( { map:texture});
                materials.push(  material1);
                if(j==0)
                    i++;
            }
        var l = geometry.faces.length / 2;
        for(var j=0;j<vertical;j++)
            for( var i = 0; i < horizontal; i ++ ) {
                var index=j*horizontal+i;

                var k = 2 * index;
                if(k>=2*l){
                    break;
                }
                geometry.faces[ k ].materialIndex = index ;
                if(j!=0 && j!=vertical-1){
                    geometry.faces[ k + 1 ].materialIndex = index ;
                }
            }
        return new THREE.Mesh(geometry,new THREE.MeshFaceMaterial(materials));
    };

    this.getSphereBlank = function () {
        var geometry   = new THREE.SphereGeometry(this.radius, 100, 100);
        var material = new THREE.MeshBasicMaterial( {
            // uniforms: {
            //     map: { value: texture }
            // },
            // vertexShader: TileShader.vertexShader,
            // fragmentShader: TileShader.fragmentShader,
            color: new THREE.Color(1,1,1),
            side: THREE.BackSide,
            transparent: false
        } );
        return new THREE.Mesh(geometry, material);
    };

    this.getPlane = function () {
        var horizontal = 2;
        var vertical = 2;
        var countTileLine = Math.pow(2, this.zoom);
        var group = new THREE.Group();
        for(var j=0;j< countTileLine;j++)
            for(var i=0;i< countTileLine;i++){
                THREE.ImageUtils.crossOrigin = '';
                var texture = THREE.ImageUtils.loadTexture(this.mapSource.GenerateUrl(i, j, this.zoom));
                var geometry = new THREE.PlaneGeometry( 1, 1, horizontal, vertical );
                var material1 = new THREE.MeshBasicMaterial( { map:texture, side: THREE.DoubleSide});
                // materials.push(  material1);

                var mesh = new THREE.Mesh(geometry, material1);
                mesh.position.set(i, -j, 0);
                group.add(mesh);
            }
        return group;
    };

    this.getTilesSphere = function () {
        var countTileLine = Math.pow(2, this.zoom);
        var group = new THREE.Group();
        for(var j=0;j< countTileLine;j++)
            for(var i=0;i< countTileLine;i++){
                var mesh = this.getTile(countTileLine, i, j);
                // mesh.position.set(i, -j, 0);
                group.add(mesh);
            }
        group.rotation.set(0, 0, Math.PI);
        return group;
    };

    this.getTile = function (countTileLine, tileI, tileJ) {
        var lengthLat = 10;
        var lengthLon = 10;
        THREE.ImageUtils.crossOrigin = '';
        var texture = THREE.ImageUtils.loadTexture(this.mapSource.GenerateUrl(tileI, tileJ, this.zoom));
        var countPoint = lengthLat * lengthLon;
        var positionBuffer = new Float32Array( countPoint * 3);
        var uvs = new Float32Array( countPoint * 2 );
        var indexBuffer = new Uint32Array( 6*(lengthLat-1)*(lengthLon));
        var normalBuffer = new Float32Array( countPoint * 3);

        var posTileI = tileI / countTileLine;
        var posTileJ = tileJ / countTileLine;

        var stepLon = 1 / countTileLine / (lengthLon - 1);
        var stepLat = 1 / countTileLine / (lengthLat - 1);
        for(var i = 0; i < lengthLat; i++){
            for(var j = 0; j < lengthLon; j++){
                var u = posTileI + i * stepLat;
                var v = posTileJ + j * stepLon;
                var indexForInsert = (i*lengthLon + j)*3;
                var geoPositionDegree = TileToWorldPos(u, v, 1);
                var normal = getXYZ(geoPositionDegree.y, geoPositionDegree.x);
                var uv = new THREE.Vector2(i/(lengthLat-1), 1 - j/(lengthLon-1));
                var vertex =  normal.multiplyScalar(this.radius);
                var newNormal = normal.multiplyScalar(-1);
                // normal.toArray(normalBuffer, indexForInsert);

                newNormal.toArray(normalBuffer, indexForInsert);
                vertex.toArray(positionBuffer, indexForInsert);
                uv.toArray(uvs, (i*lengthLon + j)*2);
            }
        }

        var count = 0;
        for ( var i = 0; i < lengthLat-1; i++ ) {
            for (var j = 0; j < lengthLon; j++) {
                var first = i * lengthLon + j;
                var second = first + lengthLon;
                if (j == lengthLon - 1) {
                    // indexBuffer[count++] = first;
                    // indexBuffer[count++] = second;
                    // indexBuffer[count++] = first - lengthLon + 1;
                    // indexBuffer[count++] = second;
                    // indexBuffer[count++] = first + 1;
                    // indexBuffer[count++] = first - lengthLon + 1;
                }
                else {
                    indexBuffer[count++] = first;
                    indexBuffer[count++] = second;
                    indexBuffer[count++] = first + 1;
                    indexBuffer[count++] = second;
                    indexBuffer[count++] = second + 1;
                    indexBuffer[count++] = first + 1;
                }
            }
        }

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(positionBuffer, 3 ) );
        geometry.addAttribute('normal', new THREE.BufferAttribute(normalBuffer, 3 ) );
        geometry.setIndex(new THREE.BufferAttribute(indexBuffer, 1 ) );
        geometry.addAttribute( 'uv', new THREE.BufferAttribute(uvs, 2 ));
        // var material = new THREE.MeshBasicMaterial( {map:texture, side: THREE.DoubleSide, vertexColors: THREE.FaceColors} );
        var material = new THREE.MeshBasicMaterial( {
            // uniforms: {
            //     map: { value: texture }
            // },
            // vertexShader: TileShader.vertexShader,
            // fragmentShader: TileShader.fragmentShader,
            map: texture,
            side: THREE.BackSide,
            transparent: false
        } );
        var mesh = new THREE.Mesh( geometry, material );
        return mesh;
    }

}
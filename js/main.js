var scene, renderer, composer;
var clearPass, texturePass, renderPass;
var cameraP, cubeTexturePassP;
      //var cameraO, cubeTexturePassO;
      var gui;

      var params = {

        clearPass: true,
        clearColor: 'white',
        clearAlpha: 1.0,

        texturePass: true,
        texturePassOpacity: 1.0,

        cubeTexturePass: true,
        cubeTexturePassOpacity: 1.0,

        renderPass: true

        //autoRotate: true,

        //camera: 'perspective'

      };

      init();
      animate();



      function init() {

        var container = document.getElementById( "container" );

        var width = window.innerWidth || 1;
        var height = window.innerHeight || 1;
        var aspect = width / height;
        var devicePixelRatio = window.devicePixelRatio || 1;

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( devicePixelRatio );
        renderer.setSize( width, height );
        document.body.appendChild( renderer.domElement );

        //

        cameraP = new THREE.PerspectiveCamera( 65, aspect, 1, 10 );
        cameraP.position.z = 7;

        //  cameraO = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 3, 10 );
        //  cameraO.position.z = 7;

        //  var fov = THREE.Math.degToRad( cameraP.fov );
        //  var hyperfocus = ( cameraP.near + cameraP.far ) / 2;
        //  var _height = 2 * Math.tan( fov / 2 ) * hyperfocus;
        //  cameraO.zoom = height / _height;

        scene = new THREE.Scene();

        var group = new THREE.Group();
        scene.add( group );

        var light = new THREE.PointLight( 0xddffdd, 1.0 );
        light.position.z = 70;
        light.position.y = - 70;
        light.position.x = - 70;
        scene.add( light );

        var light2 = new THREE.PointLight( 0xffdddd, 1.0 );
        light2.position.z = 70;
        light2.position.x = - 70;
        light2.position.y = 70;
        scene.add( light2 );

        var light3 = new THREE.PointLight( 0xddddff, 1.0 );
        light3.position.z = 70;
        light3.position.x = 70;
        light3.position.y = - 70;
        scene.add( light3 );

        var loader = new THREE.FBXLoader();
        loader.load( 'models/caminar2.fbx', function ( object ) {

          mixer = new THREE.AnimationMixer( object );

          var action = mixer.clipAction( object.animations[ 0 ] );
          action.play();

          object.traverse( function ( child ) {

            if ( child.isMesh ) {

              child.castShadow = true;
              child.receiveShadow = true;

            }

          } );

          scene.add( object );

        } );

        

        // postprocessing

        var genCubeUrls = function ( prefix, postfix ) {

          return [
          prefix + 'px' + postfix, prefix + 'nx' + postfix,
          prefix + 'py' + postfix, prefix + 'ny' + postfix,
          prefix + 'pz' + postfix, prefix + 'nz' + postfix
          ];

        };

        composer = new THREE.EffectComposer( renderer );

        clearPass = new THREE.ClearPass( params.clearColor, params.clearAlpha );
        composer.addPass( clearPass );

        texturePass = new THREE.TexturePass();
        composer.addPass( texturePass );

        var textureLoader = new THREE.TextureLoader();
        textureLoader.load( "textures/hardwood2_diffuse.jpg", function ( map ) {

          texturePass.map = map;

        } );

        cubeTexturePassP = new THREE.CubeTexturePass( cameraP );
        composer.addPass( cubeTexturePassP );

        var ldrUrls = genCubeUrls( "textures/cube/MilkyWay/dark-s_", ".jpg" );
        new THREE.CubeTextureLoader().load( ldrUrls, function ( ldrCubeMap ) {

          cubeTexturePassP.envMap = ldrCubeMap;
          console.log( "loaded envmap" );

        } );

        renderPass = new THREE.RenderPass( scene, cameraP );
        renderPass.clear = false;
        composer.addPass( renderPass );

        var copyPass = new THREE.ShaderPass( THREE.CopyShader );
        composer.addPass( copyPass );

        var controls = new THREE.OrbitControls( cameraP, renderer.domElement );

        window.addEventListener( 'resize', onWindowResize, false );

      }

      function onWindowResize() {

        var width = window.innerWidth;
        var height = window.innerHeight;
        var aspect = width / height;

        cameraP.aspect = aspect;
        cameraP.updateProjectionMatrix();

        /*cameraO.left = - height * aspect;
        cameraO.right = height * aspect;
        cameraO.top = height;
        cameraO.bottom = - height;
        cameraO.updateProjectionMatrix();*/

        renderer.setSize( width, height );

        var pixelRatio = renderer.getPixelRatio();
        var newWidth = Math.floor( width / pixelRatio ) || 1;
        var newHeight = Math.floor( height / pixelRatio ) || 1;
        composer.setSize( newWidth, newHeight );

      }

      function animate() {

        requestAnimationFrame( animate );

        

        cameraP.updateMatrixWorld( true );

        

        clearPass.enabled = params.clearPass;
        
        clearPass.clearAlpha = params.clearAlpha;

        texturePass.enabled = params.texturePass;
        texturePass.opacity = params.texturePassOpacity;

        cubeTexturePassP.enabled = params.cubeTexturePass;
        cubeTexturePassP.opacity = params.cubeTexturePassOpacity;

        renderPass.enabled = params.renderPass;

        composer.render();

        

      }
var scene, renderer, composer;
var clearPass, texturePass, renderPass;
var cameraP, cubeTexturePassP;
var clock = new THREE.Clock();
var mixer;
init();
animate();
function init() {

  var container = document.getElementById( "container" );

  var width = window.innerWidth || 1;
  var height = window.innerHeight || 1;
  var aspect = width / height;
  var devicePixelRatio = window.devicePixelRatio || 1;

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( devicePixelRatio );
  renderer.setSize( width, height );
  renderer.shadowMap.enabled = true;
  document.body.appendChild( renderer.domElement );

  cameraP = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  cameraP.position.set( 100, 200, 300 );


  scene = new THREE.Scene();


  var group = new THREE.Group();
  scene.add( group );

  light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  light.position.set( 0, 200, 0 );
  scene.add( light );

  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 200, 100 );
  light.castShadow = true;
  light.shadow.camera.top = 180;
  light.shadow.camera.bottom = - 100;
  light.shadow.camera.left = - 120;
  light.shadow.camera.right = 120;
  scene.add( light );

  var loader = new THREE.FBXLoader();
  loader.load( 'models/samba.fbx', function ( object ) {

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
    object.position.set(0,-100,0);
        object.updateMatrix();


  } );
  

  var genCubeUrls = function ( prefix, postfix ) {

    return [
    prefix + 'px' + postfix, prefix + 'nx' + postfix,
    prefix + 'py' + postfix, prefix + 'ny' + postfix,
    prefix + 'pz' + postfix, prefix + 'nz' + postfix
    ];

  };

  composer = new THREE.EffectComposer( renderer );



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

  renderer.setSize( width, height );

  var pixelRatio = renderer.getPixelRatio();
  var newWidth = Math.floor( width / pixelRatio ) || 1;
  var newHeight = Math.floor( height / pixelRatio ) || 1;
  composer.setSize( newWidth, newHeight );

}

function animate() {

  requestAnimationFrame( animate );

  cameraP.updateMatrixWorld( true );
  
  var delta = clock.getDelta();

  if ( mixer ){
    mixer.update( delta );
  } 

  renderer.render( scene, cameraP );
  composer.render();

}
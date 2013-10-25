

function start(director, images) {

    director.setImagesCache(images);

    var qs= new HN.QuizScene().create(director);



    //gs.setDifficulty(0);
    //qs.initScene();

    //HN.GameModes.classic
    director.easeIn(
            0,
            CAAT.Scene.prototype.EASE_TRANSLATE,
            1000,
            false,
            CAAT.Actor.prototype.ANCHOR_TOP,
            new CAAT.Interpolator().createExponentialInOutInterpolator(5,false) );
}

function createCanvas() {
    var director;

    if ( window.innerWidth>window.innerHeight ) {
        director= new CAAT.Director().initialize(1024,786);
    } else {
        director= new CAAT.Director().initialize(786,1024);
    }
    director.
    director.canvas.style.cssText = "idtkscale:fill;"
    if (!navigator.isCocoonJS)
    {
        director.enableResizeEvents(CAAT.Director.prototype.RESIZE_PROPORTIONAL);
    }

    return director;
}

function __quiz_init()   {

    CAAT.setCoordinateClamping(false);
    HN.LOWQUALITY= 0;
    var director= createCanvas();
    HN.director= director;

    var ni= director.width>director.height;

    var prefix= typeof __RESOURCE_URL!=='undefined' ? __RESOURCE_URL : '';


    new CAAT.ImagePreloader().loadImages(
        [
            {id:'stars',            url: prefix + 'res/img/stars.png'},
            {id:'bricks',           url: prefix + 'res/img/bricks.png'},
            {id:'buttons',          url: prefix + 'res/img/botones.png'},
            {id:'numbers',          url: prefix + 'res/img/numbers.png'},
            {id:'numberssmall',     url: prefix + 'res/img/numbers_s.png'},
            {id:'background',     url: prefix + 'res/images/grayBackgr.jpg'},
            {id:'background_op',    url: prefix + 'res/img/gameover.png'},
            {id:'cloud0',           url: prefix + 'res/img/nube1.png'},
            {id:'cloud1',           url: prefix + 'res/img/nube2.png'},
            {id:'cloud2',           url: prefix + 'res/img/nube3.png'},
            {id:'cloud3',           url: prefix + 'res/img/nube4.png'},
            {id:'cloudb0',          url: prefix + 'res/img/nubefondo1.png'},
            {id:'cloudb1',          url: prefix + 'res/img/nubefondo2.png'},
            {id:'cloudb2',          url: prefix + 'res/img/nubefondo3.png'},
            {id:'cloudb3',          url: prefix + 'res/img/nubefondo4.png'},
            {id:'level',            url: prefix + 'res/img/level.png'},
            {id:'level-small',      url: prefix + 'res/img/levelsmall.png'},
            {id:'boton-salir',      url: prefix + 'res/img/boton_salir.png'},
            {id:'points',           url: prefix + 'res/img/score.png'},
            {id:'time',             url: prefix + 'res/img/time.png'},
            {id:'timeprogress',     url: prefix + 'res/img/time_progress.png'},
            {id:'multiplier',       url: prefix + (ni ? 'res/img/x.png' : 'res/img/xsmall.png')},
            {id:'multiplier-star',  url: prefix + 'res/img/multiplicador.png'},
            {id:'levelclear',       url: prefix + 'res/img/levelcleared.png'},
            {id:'msg1',             url: prefix + 'res/img/7.png'},
            {id:'msg2',             url: prefix + 'res/img/6.png'},
            {id:'msg3',             url: prefix + 'res/img/5.png'},
            {id:'msg4',             url: prefix + 'res/img/4.png'},
            {id:'msg5',             url: prefix + 'res/img/3.png'},
            {id:'msg6',             url: prefix + 'res/img/2.png'},
            {id:'msg7',             url: prefix + 'res/img/1.png'},
            {id:'info_howto',       url: prefix + 'res/img/info.png'},
            {id:'sound',            url: prefix + 'res/img/sound.png'},
            {id:'bolas',            url: prefix + 'res/img/bolas.png'},
            {id:'target-number',    url: prefix + 'res/img/target.png'}
        ],


        function( counter, images ) {

            if ( counter==images.length ) {

                start( director, images );

                director.
                    addAudio("01",              prefix+"res/sound/01.ogg").
                    addAudio("10",              prefix+"res/sound/10.ogg").
                    addAudio("11",              prefix+"res/sound/11.ogg").
                    addAudio("12",              prefix+"res/sound/12.ogg").
                    addAudio("sumamal",         prefix+"res/sound/suma_mal.ogg").
                    addAudio("mostrarpanel",    prefix+"res/sound/mostrarpanel.ogg").
                    addAudio("deseleccionar",   prefix+"res/sound/deseleccionar.ogg").
                    addAudio("music",           prefix+"res/sound/music.ogg");

            }
        }
    );

    CAAT.loop(60);
}

window.addEventListener('load', __quiz_init, false);


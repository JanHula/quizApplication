(function() {
    HN.TopPanelManger= function() {
        return this;
    };


    HN.TopPanelManger.prototype= {

        activePane:       null,
        passivePane:       null,
        scene:       null,


        initWithScene: function( scene ) {

        this.scene=scene;

        },


        switchTo : function( switchToContainer ) {


            this.passivePane=switchToContainer;
            this.passivePane.setPosition(0,-200);
            this.scene.addChild(this.passivePane);
            var intelpolatoris=new CAAT.Behavior.Interpolator().createLinearInterpolator();

            if (this.activePane){
                this.activePane.moveTo(0, -200, 500, 0, intelpolatoris, null);

            }
            //console.log(this.passivePane);

            this.passivePane.moveTo(0, 0, 500, 100, intelpolatoris, null);
            this.activePane=this.passivePane;



        }

        /**
         *
         * @param numberImage
         * @param brick a HN.Brick instance.
         */

    };

    //extend( HN.TopPanelManger, CAAT.Class);
})();

(function() {
    HN.GuessNumberActor= function() {
        HN.GuessNumberActor.superclass.constructor.call(this);
        this.actors= [];
        this.setGlobalAlpha(true);

        return this;
    };

    HN.GuessNumberActor.prototype= {

        guessNumber:    0,
        numbersImage:   null,
        offsetX:        0,
        offsetY:        0,
        numbers:        null,
        tmpnumbers:     null,

        container:      null,
        actors:         null,

        setNumbersImage : function( image, bg ) {

            this.setBackgroundImage(bg);
            this.numbersImage= image;

            this.container= new CAAT.ActorContainer()
                .setBounds( 10,0,this.width,this.height);
            this.addChild( this.container );

            this.offsetX= (this.width - 2 * (image.singleWidth-30)) / 2;
            this.offsetY= 10 + (this.height - image.singleHeight) / 2;

            for( var i=0; i<2; i++ ) {
                var digit=
                    new CAAT.Actor()
                        .setBackgroundImage(image.getRef(), true)
                        .setLocation(this.offsetX,this.offsetY)
                        .setVisible(false)
                    ;
                
                this.actors.push(digit);
                this.container.addChild(digit).setGlobalAlpha(true);
            }


            return this;
        },
        contextEvent : function( event ) {
            var i;

            if ( event.source=='context' ) {
                if ( event.event=='guessnumber' ) {

                    var me= this;
                    me.guessNumber=   event.params.guessNumber;
                    me.numbers= [];

                    var snumber= me.guessNumber.toString();
                    if ( snumber.length===1 ) {
                        snumber='0'+snumber;
                    }
                    me.offsetX= 10;
                    me.offsetY= (me.height - me.numbersImage.singleHeight)/2;

                    var i;
                    for( i=0; i<snumber.length; i++ ) {
                        me.numbers[i]= parseInt(snumber.charAt(i));
                        this.actors[i].setLocation(
                                me.offsetX+i*(me.numbersImage.singleWidth-30),
                                this.actors[i].y );
                        this.actors[i].setVisible(true);
                    }



                    if ( null==me.tmpnumbers ) {

                        for( i=0; i<snumber.length; i++ ) {
                            this.actors[i].setAnimationImageIndex([this.numbers[i]]);
                        }

                        this.container.emptyBehaviorList();
                        this.container.addBehavior(
                            new CAAT.AlphaBehavior().
                                setFrameTime( this.time, 250 ).
                                setValues(0,1).
                                setId(1000)
                            );

                        me.tmpnumbers= me.numbers;

                    } else {
                        this.container.emptyBehaviorList();
                        this.container.addBehavior(
                            new CAAT.AlphaBehavior().
                                setFrameTime( this.time, 250 ).
                                setValues(1,0).
                                addListener( {
                                    behaviorExpired : function(behavior, time, actor) {

                                        for( i=0; i<snumber.length; i++ ) {
                                            me.actors[i].setAnimationImageIndex([me.numbers[i]]);
                                        }

                                        actor.emptyBehaviorList();
                                        actor.addBehavior(
                                            new CAAT.AlphaBehavior().
                                                setFrameTime( me.time, 250 ).
                                                setValues(0,1));

                                    },
                                    behaviorApplied : function(behavior, time, normalizedTime, actor, value) {}
                                })
                            );
                    }

                } else if ( event.event=='status') {
                    if ( event.params!=HN.Context.prototype.ST_RUNNNING ) {
                        this.numbers= null;
                        this.tmpnumbers= null;
                    }
                }
            }
        }
    };

    extend( HN.GuessNumberActor, CAAT.ActorContainer, null);

})();

(function() {
    HN.Chrono= function() {
        HN.Chrono.superclass.constructor.call(this);

        this.actorventana= new CAAT.Actor();
        this.actorcrono= new CAAT.Actor().setLocation(14,18);
        this.addChild( this.actorcrono );
        this.addChild( this.actorventana );

        return this;
    };

    HN.Chrono.prototype= {

        maxTime:    0,
        elapsedTime:0,

        actorventana:   null,
        actorcrono:     null,

        progressHole:  160,

        setImages : function( background, progress ){
            this.actorventana.setBackgroundImage(background, true);
            this.actorcrono.setBackgroundImage(progress, true);

            this.setSize( this.actorventana.width, this.actorventana.height );
            this.actorcrono.setImageTransformation( CAAT.SpriteImage.prototype.TR_FIXED_TO_SIZE );
            return this;
        },
        animate : function(director, time) {
            var size=
                    this.maxTime!=0 ?
                            this.elapsedTime/this.maxTime * this.progressHole :
                            0;
            // make sure this actor is marked as dirty by calling setSize and not .width=new_size.
            this.actorcrono.setSize( this.progressHole-size, this.actorcrono.height );

            return HN.Chrono.superclass.animate.call(this,director,time);
        },
        tick : function( iElapsedTime, maxTime ) {
            this.maxTime= maxTime;
            this.elapsedTime= iElapsedTime;
        },
        contextEvent : function(event) {
            if ( event.source=='context' && event.event=='status') {
                if ( event.params==HN.Context.prototype.ST_ENDGAME ) {
                    this.maxTime=0;
                    this.elapsedTime= 1000;
                }
            }
        }
    };

    extend( HN.Chrono, CAAT.ActorContainer);
})();

(function() {
    HN.SelectionPath= function(director) {
        HN.SelectionPath.superclass.constructor.call(this);

        this.coords=        [];
        this.particles=     [];
        this.fillStyle=     null;
        this.bolasImage=
                new CAAT.SpriteImage().initialize(
                    director.getImage('bolas'),1,8);
        this.director=      director;
        return this;
    };

    HN.SelectionPath.prototype= {

        coords:                 null,   // an array of 2D positions on screen.
        path:                   null,
        pathMeasure:            null,
        particles:              null,   // an array of random time to position on path.
        particlesPerSegment:    10,
        traversingPathTime:     3000,
        context:                null,
        bolasImage:             null,
        director:               null,

        /**
         *
         * @param bolas {CAAT.SpriteImage}
         */
        initialize : function() {
            this.coords=        [];
            this.path=          null;
            this.pathMeasure=   null;
        },
        setup : function( context, brickActors ) {

            var i;

            this.context= context;
            this.brickActors= brickActors;
            this.coords= [];

            // no bricks, no path
            if ( 0==context.selectedList.length ) {
                this.initialize();
                return;
            }

            var expectedParticleCount= this.particlesPerSegment*(context.selectedList.length-1);
            if ( this.particles.length> expectedParticleCount ) {
                this.particles.splice( expectedParticleCount, this.particles.length-expectedParticleCount );
            } else {
                while( this.particles.length<expectedParticleCount ) {
                    this.particles.push( (context.selectedList.length)*this.traversingPathTime + this.traversingPathTime*Math.random() );
                }
            }
        },
        setupPath : function() {
            this.coords= [];

            if ( this.context.selectedList.length ) {
                var numberWidth= this.brickActors[0][0].width;
                var numberHeight= this.brickActors[0][0].height;
                var offsetX= (this.context.columns-this.context.currentColumns)/2*numberWidth;
                var offsetY= (this.context.rows-this.context.currentRows)/2*numberHeight;

                // get selected bricks screen coords.
                for( i=0; i<this.context.selectedList.length; i++ )  {
                    var brick= this.context.selectedList[i];
                    var brickActor= this.brickActors[brick.row][brick.column];
                    this.coords.push(
                        {
                            x: brickActor.x + brickActor.width/2,// + offsetX,
                            y: brickActor.y + brickActor.height/2// + offsetY
                        });
                }

                // setup a path for the coordinates.
                this.path= new CAAT.Path();
                this.path.beginPath( this.coords[0].x, this.coords[0].y );
                for( i=1; i<this.context.selectedList.length; i++ ) {
                    this.path.addLineTo( this.coords[i].x, this.coords[i].y );
                }
                this.path.endPath();
                this.pathMeasure= new CAAT.PathBehavior().
                        setPath(this.path).
                        setFrameTime(0, this.traversingPathTime*this.context.selectedList.length).
                        setCycle(true);
            }
        },
        paint : function(director, time)    {
            if ( null!=this.context && 0!=this.context.selectedList.length ) {

                var i;
                this.setupPath();


                var ctx= director.ctx;

                ctx.beginPath();
                var i;
                for( i=0; i<this.coords.length; i++ ) {
                    ctx.lineTo( this.coords[i].x, this.coords[i].y );
                }

                ctx.strokeStyle=    '#ffff00';
                ctx.lineCap=        'round';
                ctx.lineJoin=       'round';

                for( i=2; i<=(CAAT.browser==='iOS' ? 2 : 8); i+=2 ) {

                    ctx.lineWidth=  i;
                    ctx.globalAlpha= .5 - i/8/3;
                    ctx.stroke();
                }

                if ( this.pathMeasure ) {
                    var pos;
                    for(i=0; i<this.particles.length; i++) {
                        pos= this.pathMeasure.positionOnTime( (this.particles[i]+time)*(1+(i%3)*.33) );
                        this.bolasImage.setSpriteIndex(i%8);
                        this.bolasImage.paint( director, 0, pos.x-4, pos.y-4 );
                    }
                }
            }

        },
        contextEvent : function( event ) {
            /*
            if ( event.source=='brick' &&
                (event.event=='selection' || event.event=='selectionoverflow' || event.event=='selection-cleared') ) {
                this.setupPath();
            }
            */
        },
        paintActorGL : function(director,time) {

            if ( null!=this.context && this.context.selectedList.length>1 ) {
                this.setupPath();
                if ( null===this.coords || 0===this.coords.length ) {
                    return;
                }


                director.glFlush();

                var i,
                    pos=0,
                    z= 0,
                    point= new CAAT.Point(),
                    m= this.worldModelViewMatrix,
                    cc= director.coords,
                    ccthis= this.coords,
                    pa= this.particles;

                for( i=0; i<ccthis.length; i++ ) {
                    point.set(ccthis[i].x, ccthis[i].y,0);
                    m.transformCoord(point);
                    cc[pos++]= point.x;
                    cc[pos++]= point.y;
                    cc[pos++]= z;
                }
                for( i=2; i<=8; i+=2 ) {
                    director.glTextureProgram.drawPolylines(cc, ccthis.length, 1,1,0,.5 - i/8/3, i);
                }


                //
                // setup particles
                //

                pos=0;
                for(i=0; i<pa.length; i++) {
                    ppos= this.pathMeasure.positionOnTime( (pa[i]+time)*(1+(i%3)*.33) );
                    point.set(ppos.x, ppos.y,0);
                    m.transformCoord(point);
                    cc[pos++]= point.x-3;
                    cc[pos++]= point.y-3;
                    cc[pos++]= z;

                    cc[pos++]= point.x+3;
                    cc[pos++]= point.y+3;
                    cc[pos++]= z;
                }
                director.glTextureProgram.drawLines(cc, pa.length, 1,1,1,.3, 7);

            }
        }
    };

    extend( HN.SelectionPath, CAAT.Actor);
})();

(function() {
    HN.ScoreActor= function() {
        HN.ScoreActor.superclass.constructor.call(this);
        return this;
    };

    HN.ScoreActor.prototype= {

        numDigits:      6,

        incrementScore: 0,
        maxScore:       0,
        minScore:       0,
        currentScore:   0,

        numbers:        null,

        startTime:      0,
        interpolator:   null,
        scoreDuration:  2000,

        font:           null,

        FONT_CORRECTION:    .6,


        reset : function() {
            this.currentScore= 0;
            this.maxScore= 0;
            this.minScore= 0;
            this.currentScore=0;
            this.setScore();
        },
        initialize : function(font, background) {

            var i;

            this.font= font;
            this.interpolator= new CAAT.Interpolator().createExponentialInOutInterpolator(2,false);
            this.setBackgroundImage(background, true);

            for( i=0; i<this.numDigits; i++ ) {
                var actor= new CAAT.Actor().
                        setBackgroundImage(font.getRef(), true).
                        setLocation(
                            (((this.width-this.numDigits*this.font.singleWidth*this.FONT_CORRECTION)/2)>>0) +
                                (i*this.font.singleWidth*this.FONT_CORRECTION) - 5,
                            12
                        ).
                        setScale( this.FONT_CORRECTION, this.FONT_CORRECTION );

                this.addChild(actor);
            }

            return this;
        },
        contextEvent : function( event ) {
            if ( event.source=='context' ) {
                if ( event.event=='score' ) {
                    this.maxScore= event.params.score;
                    this.minScore= this.currentScore;
                    this.incrementScore= this.maxScore- this.minScore;
                    this.startTime= this.time;
                } else if ( event.event=='status') {
                    if ( event.params==HN.Context.prototype.ST_STARTGAME ) {
                        this.reset();
                    }
                }
            }
        },
        setScore: function(director) {
            this.currentScore>>=0;
            var str= ''+this.currentScore;
            while( str.length<6 ) {
                str='0'+str;
            }

            this.numbers= [];
            var i=0;
            for( i=0; i<str.length; i++ ) {
                this.numbers[i]= parseInt(str.charAt(i));
                this.childrenList[i].setAnimationImageIndex([this.numbers[i]]);
            }
        },
        animate : function(director, time) {
            if ( time>= this.startTime && time<this.startTime+this.scoreDuration ) {
                this.currentScore=
                        this.minScore +
                            this.incrementScore *
                            this.interpolator.getPosition( (time-this.startTime)/this.scoreDuration ).y;
                this.setScore(director);
                
            } else {
                if ( this.currentScore!=this.maxScore ) {
                    this.currentScore= this.maxScore;
                    this.setScore(director);
                }
            }

            return HN.ScoreActor.superclass.animate.call(this,director,time);
        }
    };

    extend( HN.ScoreActor, CAAT.ActorContainer);
})();

(function() {

    HN.AnimatedBackground= function() {
        HN.AnimatedBackground.superclass.constructor.call(this);
        return this;
    };

    HN.AnimatedBackground.prototype= {
        timer:                      null,
        context:                    null,
        scene:                      null,
        altitude:                   .05,
        altitudeMeterByIncrement:   2,
        currentAltitude:            0,
        initialOffset:              0,
        currentOffset:              0,

        setData : function(scene, gameContext) {
            this.context= gameContext;
            this.scene= scene;
            return this;
        },
        contextEvent : function( event ) {

            var me= this;

            if ( event.source=='context' ) {
                if ( event.event=='status') {
                    if ( event.params==HN.Context.prototype.ST_ENDGAME ) {
                        if ( this.timer!=null ) {
                            this.timer.cancel();
                            this.timer= null;
                            this.currentOffset= this.backgroundImage.offsetY;
                            this.addBehavior(
                                    new CAAT.GenericBehavior().
                                            setFrameTime( this.scene.time, 1000 ).
                                            setValues(this.currentOffset, this.initialOffset, null, null,
                                                function(value,target,actor) {
                                                    me.setBackgroundImageOffset(0,value);
                                                }).
                                            setInterpolator( new CAAT.Interpolator().
                                                createBounceOutInterpolator(false) )
                                    );

                            me.currentAltitude= me.initialOffset;
                        }
                    } else if ( event.params==HN.Context.prototype.ST_LEVEL_RESULT ) {
                        this.timer.cancel();
                    }
                } else if ( event.event=='levelchange') {
                    this.startTimer();
                }
            }
        },
        startTimer : function() {
            var me= this;
            if ( !this.timer ) {
                this.timer= this.scene.createTimer(
                    me.scene.time,
                    200,
                    function timeout(sceneTime, time, timerTask) {

                        me.currentAltitude+= me.altitude;
                        if ( me.currentAltitude>0 ) {
                            me.currentAltitude=0;
                        }
                        me.setBackgroundImageOffset( 0, me.currentAltitude );
                        timerTask.reset( me.scene.time );
                        me.context.incrementAltitude( me.altitudeMeterByIncrement );
                    },
                    null,
                    null );
            }
        },
        setInitialOffset : function( offset ) {
            this.setBackgroundImageOffset( 0, offset );
            this.initialOffset= offset;
            this.currentAltitude= offset;
            return this;
        },
        caer : function(time) {
            this.setBackgroundImageOffset( 0, this.currentOffset + (this.initialOffset-this.currentOffset)*time );
        }
    };

    extend( HN.AnimatedBackground, CAAT.Actor);

})();

(function() {

    HN.BackgroundImage= function() {
        HN.BackgroundImage.superclass.constructor.call(this);
        return this;
    };

    HN.BackgroundImage.prototype= {

        setupBehavior : function(director, bFirstTime) {

            var is_bg= Math.random()<.4;

            this.setBackgroundImage( director.getImage('cloud'+(is_bg ? 'b' : '')+ ((4*Math.random())>>0) ), true );
            
            var t= (30000*(is_bg?1.5:1) + 5000*Math.random()*2);
            var me= this;
            var ix0, ix1, iy0, iy1;
            var dw= director.width;
            var dh= director.height-200;

            var ih= this.backgroundImage.height;
            var iw= this.backgroundImage.width;

            if ( bFirstTime ) {
                ix0= dw*Math.random();
                iy0= dh*Math.random();
                t= (dw-ix0)/dw*t;
            } else {
                ix0= -iw-iw*Math.random();
                iy0= dh*Math.random();
            }
            ix1= dw+iw*Math.random();
            iy1= iy0 + Math.random()*30;

            this.emptyBehaviorList();
            this.addBehavior(
                    new CAAT.PathBehavior().
                            setFrameTime( this.time, t ).
                            setPath(
                                new CAAT.Path().setLinear(ix0, iy0, ix1, iy1)
                            ).
                            addListener( {
                                behaviorExpired : function(behavior, time, actor) {
                                    me.setupBehavior(director, false);
                                },
                                behaviorApplied : function(actor,time,normalizedTime,value) {
                                    
                                }
                            })
                    );

            return this;
        }
    };

    extend( HN.BackgroundImage, CAAT.Actor);
})();

(function() {
    HN.LevelActor= function() {
        HN.LevelActor.superclass.constructor.call(this);
        this.numbers= [];
        return this;
    };

    HN.LevelActor.prototype= {
        font:       null,
        numbers:    null,

        initialize : function(font, background) {
            this.font= font;

            for( var i=0; i<2; i++ ) {
                var digit= new CAAT.Actor().
                        setBackgroundImage(font.getRef(), true).
                        setVisible(false);
                this.numbers.push(digit);
                this.addChild(digit);
            }

            this.setBackgroundImage(background, true);

            return this;
        },
        contextEvent : function(event) {
            if ( event.source=='context' ) {
                if ( event.event=='levelchange') {
                    this.level=   event.params;

                    var snumber= this.level.toString();
                    var i, number;
                    var correction= this.font.singleWidth*.8;

                    for( i=0; i<snumber.length; i++ ) {
                        number= parseInt(snumber.charAt(i));
                        this.numbers[i].
                            setSpriteIndex(number).
                            setLocation(
                                (this.width - snumber.length*correction)/2 + i*correction, 24 ).
                            setVisible(true);
                    }

                    for( ;i<this.numbers.length; i++ ) {
                        this.numbers[i].setVisible(false);
                    }

                }
            }
        }
    };

    extend(HN.LevelActor, CAAT.ActorContainer);
})();

(function() {
    HN.MultiplierActor= function() {
        HN.MultiplierActor.superclass.constructor.call(this);

        this.actorx=    new CAAT.Actor().setVisible(false);
        this.actornum=  new CAAT.Actor();

        this.addChild(this.actorx);
        this.addChild(this.actornum);

        return this;
    };

    HN.MultiplierActor.prototype= {

        actorx:     null,
        actornum:   null,

        multiplier: 0,

        setImages : function( font, x ) {

            this.actorx.setBackgroundImage(x,true);
            this.actornum.setBackgroundImage(font,true).setVisible(false);

            var xoffset= (this.width-x.width-font.singleWidth)/2 + 10;

            this.actorx.setLocation( xoffset, this.height-x.height+5 );
            this.actornum.setLocation( xoffset+x.width, 0 );

            return this;
        },
        hideMultiplier : function() {
            this.multiplier=0;
            this.actornum.setVisible(false);
            this.actorx.setVisible(false);
        },
        b1 : function(actor) {
            actor.emptyBehaviorList();
            var cb= new CAAT.ContainerBehavior().
                    setFrameTime(this.time,1000).
                    setCycle(true);

            var ab= new CAAT.AlphaBehavior().
                    setFrameTime(0,1000).
                    setValues(.6,.8).
                    setPingPong();

            cb.addBehavior(ab);

            actor.addBehavior(cb);
        },
        b2 : function(actor) {
            var me= this;
            actor.emptyBehaviorList();
            var ab= new CAAT.AlphaBehavior().
                    setFrameTime(this.time,300).
                    setValues( this.alpha, 0 ).
                    addListener( {
                        behaviorExpired : function(behavior, time, actor) {
                            me.hideMultiplier();
                        },
                        behaviorApplied : function(actor,time,normalizedTime,value) {}
                    });
            actor.addBehavior(ab);            
        },
        contextEvent : function( event ) {

            if ( event.source == 'context' ) {
                if ( event.event=='multiplier' ) {

                    if ( event.params.multiplier>1 ) {
                        this.multiplier = event.params.multiplier;
                        this.actornum.setVisible(true).setAnimationImageIndex([this.multiplier]);
                        this.actorx.setVisible(true);

                        this.emptyBehaviorList();
                        this.addBehavior(
                            new CAAT.ScaleBehavior().
                                setFrameTime(this.time,1000).
                                setValues(.9, 1.1, .9, 1.1 ).
                                setPingPong().
                                setCycle(true));

                        this.b1(this.actorx);
                        this.b1(this.actornum);

                    } else {
                        this.emptyBehaviorList();
                        this.b2(this.actorx);
                        this.b2(this.actornum);
                    }
                } else if ( event.event=='status') {
                    if ( event.params==HN.Context.prototype.ST_ENDGAME ) {
                        this.hideMultiplier();
                    }
                }
            }
        }
    };

    extend( HN.MultiplierActor, CAAT.ActorContainer);
})();

(function() {
    HN.MultiplierActorS= function() {
        HN.MultiplierActorS.superclass.constructor.call(this);

        this.star=      new CAAT.Actor();
        this.container= new CAAT.ActorContainer();
        this.actorx=    new CAAT.Actor();
        this.actornum=  new CAAT.Actor();

        this.addChild(this.star);
        this.addChild(this.container);
        this.container.addChild(this.actorx);
        this.container.addChild(this.actornum);

        this.container.setGlobalAlpha(true);

        return this;
    };

    HN.MultiplierActorS.prototype= {

        actorx:     null,
        actornum:   null,
        star:       null,

        multiplier: 0,

        setImages : function( font, x, star, scene ) {

            this.scene= scene;
            this.setOutOfFrameTime();

            this.star.setBackgroundImage(star);
            var S= this.star.width/2;
            this.actorx.setBackgroundImage(x,false).
                setBounds(0, (this.star.height-S)/2, S, S).
                setImageTransformation( CAAT.SpriteImage.prototype.TR_FIXED_TO_SIZE );
            this.actornum.setBackgroundImage(font,true).
                setScale( .4,.4 ).
                setLocation( 0, -20 );

            this.setSize( this.star.width, this.star.height);
            this.container.setSize( this.star.width, this.star.height);
            this.container.setRotation( Math.PI/16 );

            this.star.setLocation( 0,0 );


            return this;
        },
        hideMultiplier : function() {
            this.multiplier=0;
            this.setOutOfFrameTime();
        },
        b1 : function(actor) {
            actor.emptyBehaviorList();
            var cb= new CAAT.ContainerBehavior().
                    setFrameTime(this.scene.time,1000).
                    setCycle(true);

            var ab= new CAAT.AlphaBehavior().
                    setFrameTime(0,1000).
                    setValues(.8,1).
                    setPingPong();

            var sb= new CAAT.ScaleBehavior().
                setFrameTime(0,1000).
                setValues(.8, 1, .8, 1).
                setPingPong();

            cb.addBehavior(ab);
            cb.addBehavior(sb);

            actor.addBehavior(cb);
        },
        b2 : function(actor) {
            var me= this;
            actor.emptyBehaviorList();
            var ab= new CAAT.AlphaBehavior().
                    setFrameTime(this.time,300).
                    setValues( this.alpha, 0 ).
                    addListener( {
                        behaviorExpired : function(behavior, time, actor) {
                            me.hideMultiplier();
                        },
                        behaviorApplied : function(actor,time,normalizedTime,value) {}
                    });
            actor.addBehavior(ab);
        },
        contextEvent : function( event ) {

            if ( event.source == 'context' ) {
                if ( event.event=='multiplier' ) {

                    if ( event.params.multiplier>1 ) {
                        this.multiplier = event.params.multiplier;
                        this.actornum.setAnimationImageIndex([this.multiplier]);
                        this.setFrameTime(0, Number.MAX_VALUE);

                        this.emptyBehaviorList();
                        this.star.addBehavior(
                            new CAAT.RotateBehavior().
                                setFrameTime(this.time,1000).
                                setValues(0, Math.PI*2 ).
                                setCycle(true));

                        this.b1(this.container);

                    } else {
                        this.emptyBehaviorList();
                        this.b2(this.container);
                    }
                } else if ( event.event=='status') {
                    if ( event.params==HN.Context.prototype.ST_ENDGAME ) {
                        this.hideMultiplier();
                    }
                }
            }
        }
    };

    extend( HN.MultiplierActorS, CAAT.ActorContainer);
})();

(function() {
    HN.QuizScene= function() {
        this.gameListener= [];
        return this;
    };

    HN.QuizScene.prototype= {

        directorScene:              null,

        director:                   null,

		directorWidth:              null,
		
		directorHeigth:              null,

        backroundImg:              null,
        actor:              null,
        passiveTopPane:             null,
        activeTopPane:       null,

        LinInterpolator:        null,
        /**
         * Creates the main game Scene.
         * @param director a CAAT.Director instance.
         */
        create : function(director) {


            this.director= director;

            /*this.bricksImageAll= new CAAT.SpriteImage().initialize(
                    director.getImage('bricks'), 9, 10 );

            this.brickWidth=  this.bricksImageAll.singleWidth;
            this.brickHeight= this.bricksImageAll.singleHeight;

            this.buttonImage= new CAAT.SpriteImage().initialize(
                    director.getImage('buttons'), 7,3 );
            this.starsImage= new CAAT.SpriteImage().initialize(
                    director.getImage('stars'), 24,6 );
            this.numbersImage= new CAAT.SpriteImage().initialize(
                    director.getImage('numbers'), 1,10 );
            this.numbersImageSmall= new CAAT.SpriteImage().initialize(
                    director.getImage('numberssmall'), 1,10 );

            this.context= new HN.Context().
                    create( 8,8, 9 ).
                    addContextListener(this);

            this.gameRows=      this.context.rows;
            this.gameColumns=   this.context.columns;*/


            this.directorScene= director.createScene();


            this.directorHeigth= director.width;
            this.directorWidth= director.height;

            //===================CREATE BACKGROUND


            this.backroundImg= new CAAT.SpriteImage().
                initialize(director.getImage('background'), 1,1 );

			var  BackgroundActor=new CAAT.Actor().
                                setBackgroundImage( this.backroundImg.getRef(), true ).
                                enableEvents(false).
                                setDiscardable(true).
                                setPosition(0,0).
                                setSpriteIndex(0);

            this.directorScene.addChild(BackgroundActor);



            //===================INIT TOPPANEL MANAGER
            this.TopPanelManger=new HN.TopPanelManger();
            this.TopPanelManger.initWithScene(this.directorScene);

            //===================temporaty button
            var numbersImage= new CAAT.SpriteImage().
                initialize(director.getImage('numbers'), 1,10 );
            this.actor= new CAAT.Actor().
                setBackgroundImage(numbersImage.getRef(), true ).
                enableEvents(true).
                setDiscardable(true).
                setPosition(100,100).
                setSpriteIndex(5);
            //this.actor.manager=this;

            this.actor.mouseDown    =  this.goToScene.bind(this);



            this.directorScene.addChild(this.actor);


			return this;



            //===================CREATE LINEAR INTERPOLATOR
            this.LinInterpolator=new CAAT.Behavior.Interpolator().createLinearInterpolator();


        },
		
		goToScene: function() {

            var numbersImage= new CAAT.SpriteImage().
                initialize(this.director.getImage('numbers'), 1,10 );

            var actor= new CAAT.Actor().
                setBackgroundImage(numbersImage.getRef(), true ).
                enableEvents(false).
                setDiscardable(true).
               // setPosition(0,0).
                setSpriteIndex(1);

            var actor2= new CAAT.Actor().
                setBackgroundImage(numbersImage.getRef(), true ).
                enableEvents(false).
                setDiscardable(true).
                // setPosition(0,0).
                setSpriteIndex(2);

            var actor3= new CAAT.Actor().
                setBackgroundImage(numbersImage.getRef(), true ).
                enableEvents(false).
                setDiscardable(true).
                // setPosition(0,0).
                setSpriteIndex(3);

            this.switchTopPanel(actor);
            this.switchMiddlePanel(actor2);
            this.switchBottomPanel(actor3);
		},


        switchTopPanel : function( switchToContainer ) {

            if(this.passiveTopPane){

                this.passiveTopPane.destroy();
            }
            this.passiveTopPane=switchToContainer;
            this.passiveTopPane.setPosition(0,-200);
            this.directorScene.addChild(this.passiveTopPane);


            if (this.activeTopPane){
                this.activeTopPane.moveTo(0, -200, 500, 0,this.LinInterpolator,null);

            }
            //console.log(this.passivePane);

            this.passiveTopPane.moveTo(0, 0, 500, 100, this.LinInterpolator, null);

            var provizpass=this.passiveTopPane;
            var provizact=this.activeTopPane;
            this.activeTopPane=provizpass;
            this.passiveTopPane=provizact;



        },

        switchMiddlePanel : function( switchToContainer ) {

            if(this.passiveMiddlePane){

                this.passiveMiddlePane.destroy();
            }
            this.passiveMiddlePane=switchToContainer;
            this.passiveMiddlePane.setPosition(-1500,100);
            this.directorScene.addChild(this.passiveMiddlePane);


            if (this.activeMiddlePane){
                this.activeMiddlePane.moveTo(1500, 100, 500, 0,this.LinInterpolator,null);

            }


            this.passiveMiddlePane.moveTo(0, 100, 500, 100, this.LinInterpolator, null);

            var provizpass=this.passiveMiddlePane;
            var provizact=this.activeMiddlePane;
            this.activeMiddlePane=provizpass;
            this.passiveMiddlePane=provizact;



        },


        switchBottomPanel : function( switchToContainer ) {

            if(this.passiveBottomPane){

                this.passiveBottomPane.destroy();
            }
            this.passiveBottomPane=switchToContainer;
            this.passiveBottomPane.setPosition(0,this.directorHeigth+200);
            this.directorScene.addChild(this.passiveBottomPane);


            if (this.activeBottomPane){
                this.activeBottomPane.moveTo(0, this.directorHeigth+200, 500, 0,this.LinInterpolator,null);

            }


            this.passiveBottomPane.moveTo(0, this.directorHeigth-300, 500, 100, this.LinInterpolator, null);
            var provizpass=this.passiveBottomPane;
            var provizact=this.activeBottomPane;
            this.activeBottomPane=provizpass;
            this.passiveBottomPane=provizact;



        },

		
		createMyActor : function() {
            var actor= new CAAT.Actor().
                setBackgroundImage( this.numbersImage.getRef(), true ).
                enableEvents(false).
                setDiscardable(true).
				setPosition(0,0).
				setSpriteIndex(0);
            return actor;
        },
		
		
        create_cache: function() {
            this.selectionStarCache= [];
            this.fallingStarCache=   [];

            var i,actor,me;

            me= this;

            for( i=0; i<16*4; i++ ) {
                actor= this.createSelectionStarCache();
                actor.addListener( {
                    actorLifeCycleEvent : function(actor, event, time) {
                        if (event === 'destroyed') {
                            me.selectionStarCache.push(actor);
                        }
                    }
                });
                actor.__parent= this.particleContainer;
                this.selectionStarCache.push(actor);
            }

            for( i=0; i<384; i++ ) {
                var actor= this.createCachedStar();
                actor.addListener( {
                    actorLifeCycleEvent : function(actor, event, time) {
                        if (event === 'destroyed') {
                            me.fallingStarCache.push(actor);
                        }
                    }
                });
                actor.__parent= this.particleContainer;
                this.fallingStarCache.push(actor);
            }
        },
        createCachedStar : function(director) {
            var iindex= (Math.random()*this.starsImage.columns)>>0;
            var actor= new CAAT.Actor();
            actor.__imageIndex= iindex;
            actor.
                setBackgroundImage( this.starsImage.getRef().setAnimationImageIndex( [iindex] ), true ).
                enableEvents(false).
                setDiscardable(true).
                setOutOfFrameTime().
                addBehavior(
                    this.director.getRenderType()==='CSS' ?
                        new CAAT.AlphaBehavior().
                            setValues( 1, .1 ).
                            setId('__alpha'):
                        new CAAT.GenericBehavior().
                            setValues( 1, .1, null, null, function(value,target,actor) {
                                actor.backgroundImage.setAnimationImageIndex( [
                                        actor.__imageIndex+(23-((23*value)>>0))*actor.backgroundImage.getColumns()
                                    ] );
                            }).
                            setId('__alpha') );

            return actor;
        },
        createSelectionStarCache : function() {
            var actor= this.createCachedStar();

            var trb=
                new CAAT.PathBehavior().
                    setFrameTime(this.directorScene.time,0).
                    setPath(
                        new CAAT.LinearPath().
                            setInitialPosition(0,0).
                            setFinalPosition(0,0)
                    ).
                    setInterpolator(
                        new CAAT.Interpolator().createExponentialOutInterpolator(
                            2,
                            false)
                    );
            actor.__trb= trb;
            actor.addBehavior(trb);

            var ab= null;
            if ( this.director.getRenderType()==='CSS' ) {
                ab= new CAAT.AlphaBehavior().setValues( 1, .1 );
            } else {
                ab= new CAAT.GenericBehavior().
                        setValues( 1, .1, null, null, function(value,target,actor) {
                            actor.backgroundImage.setAnimationImageIndex( [
                                    actor.__imageIndex+(23-((23*value)>>0))*actor.backgroundImage.getColumns()
                                ] );
                        });
            }
            actor.__ab= ab;
            actor.addBehavior(ab);


            return actor;
        },
        create_respawntimer: function(director) {
            var clock= new HN.RespawnClockActor().create().initialize(director, this.directorScene, this.context);
            this.directorScene.addChild( clock );
            this.context.addContextListener(clock);
            this.respawnClock= clock;
            this.respawnClock.setOutOfFrameTime();
        },
        create_EndLevel : function( director ) {
            this.endLevelActor= new CAAT.ActorContainer().
                    setBackgroundImage( director.getImage('levelclear'), true);

            var me= this;
            var me_endLevel= this.endLevelActor;
            var continueButton= new CAAT.Actor().
                    setAsButton( this.buttonImage.getRef(), 12,13,14,12,
                        function(button) {
                            director.audioPlay('11');
                            me.removeGameEvent( me.endLevelActor, function() {
                                me.context.nextLevel();
                            });
                        });
            continueButton.setLocation(
                    (this.endLevelActor.width-continueButton.width)/2,
                    this.endLevelActor.height-continueButton.height-50 );


            this.endLevelMessage= new CAAT.Actor().
                    setBackgroundImage( director.getImage('msg1'), true );

            this.endLevelActor.addChild(continueButton);
            this.endLevelActor.addChild(this.endLevelMessage);
            this.endLevelActor.setOutOfFrameTime();
            this.directorScene.addChild(this.endLevelActor);
        },
        create_EndGame : function(director, go_to_menu_callback ) {
            var me= this;

            this.endGameActor= new CAAT.ActorContainer().
                    setBackgroundImage( director.getImage('background_op'), true );

            var restart= new CAAT.Actor().
                    setAsButton( this.buttonImage.getRef(), 12,13,14,12,
                        function(button) {
                            director.audioPlay('11');
                            me.removeGameEvent( me.endGameActor, function() {
                                me.prepareSceneIn(me.context.gameMode);
                                me.context.initialize();
                            })
                        });

            var x= 45;
            //var x= (this.endGameActor.width-2*menu.width-30)/2;
            var y= this.endGameActor.height-35-restart.height;


            restart.setLocation( x+10, y );

            this.endGameActor.addChild(restart);

            var __buttons= [ restart ];
            CAAT.modules.LayoutUtils.row(
                this.endGameActor,
                __buttons,
                {
                    padding_left:   50,
                    padding_right:  50,
                    top:            y
                });

            //////////////////////// info de partida
            this.levelActorEG= new HN.LevelActor().
                    initialize(this.numbersImageSmall, director.getImage('level'));
            this.levelActorEG.
                    setBounds(
                        (this.endGameActor.width-this.levelActorEG.width)/2,
                        265,
                        this.levelActorEG.width,
                        this.levelActorEG.height );
            this.endGameActor.addChild(this.levelActorEG);
            this.context.addContextListener(this.levelActorEG);

            ///////////////////// score
            this.scoreActorEG= new HN.ScoreActor().
                    create().
                    setBounds(
                        ((this.endGameActor.width-this.scoreActor.width)/2)|0,
                        335,
                        this.scoreActor.width,
                        this.scoreActor.height ).
                    initialize( this.numbersImageSmall, director.getImage('points') );
            this.endGameActor.addChild( this.scoreActorEG );
            this.context.addContextListener(this.scoreActorEG);

            this.endGameActor.setOutOfFrameTime();

            this.directorScene.addChild(this.endGameActor);
        },
        getBrickPosition : function(row,column) {
            return {
                x: (this.context.columns-this.context.currentColumns)/2*this.brickWidth+ column*this.brickWidth,
                y: (this.context.rows-this.context.currentRows)/2*this.brickHeight+ row*this.brickHeight
            };
        },
        uninitializeActors : function() {
            this.selectionPath.initialize();

            var i, j;
            var radius= Math.max(this.director.width,this.director.height );
            var angle=  Math.PI*2*Math.random();
            var me=     this;

            var p0= Math.random()*this.director.width;
            var p1= Math.random()*this.director.height;
            var p2= Math.random()*this.director.width;
            var p3= Math.random()*this.director.height;

            for( i=0; i<this.gameRows; i++ ) {
                for( j=0; j<this.gameColumns; j++ ) {
                    var brickActor= this.brickActors[i][j];

                    if ( brickActor.brick.removed ) {
                        continue;
                    }

                    var random= Math.random()*1000;

                    brickActor.pb.
                            emptyListenerList().
//                            setFrameTime(this.directorScene.time, 1000+random).
                            setPath(
                                new CAAT.CurvePath().
                                        setCubic(
                                            brickActor.x, brickActor.y,
                                            p0, p1,
                                            p2, p3,
                                            radius/2 + Math.cos(angle)*radius,
                                            radius/2 + Math.sin(angle)*radius
                                         )
                                ).
                            setInterpolator(
                                new CAAT.Interpolator().createExponentialInOutInterpolator(3,false) );
                    if (!HN.LOWQUALITY) {
                        brickActor.pb.
                                setFrameTime(this.directorScene.time, 1000+random );
                    } else {
                        brickActor.pb.
                                setFrameTime(this.directorScene.time + i*200, 700+random/3 );
                    }

                    if (!HN.LOWQUALITY) {
                        brickActor.sb.
                                emptyListenerList().
                                setFrameTime(this.directorScene.time , 1000+random).
                                setValues( 1, .1, 1 , .1).
                                setInterpolator(
                                    new CAAT.Interpolator().createExponentialInOutInterpolator(3,false) );
                    }
                    
                    brickActor.
                        enableEvents(false).
                        setAlpha(1).
                        resetTransform();

                }
            }

        },
        initializeActors : function() {

            this.selectionPath.initialize();

            var i, j;
            var maxt= 0;
            var animationDuration;
            var animationStartTime;
            var stepTime= 30;
            var brickPosition;
            var context;
/*
            for( i=0; i<this.gameRows; i++ ) {
                for( j=0; j<this.gameColumns; j++ ) {
                    var brickActor= this.brickActors[i][j];

                    if ( brickActor.brick.removed ) {
                        brickActor.setOutOfFrameTime();
                    } else {

                        brickActor.
                            setFrameTime( this.directorScene.time, Number.MAX_VALUE ).
                            setAlpha(1).
                            enableEvents(false).
                            reset();

                        animationDuration= 1000+((Math.random()*1000)>>0);
                        brickPosition= this.getBrickPosition(i,j);

                        animationStartTime= (i+j)*stepTime + this.directorScene.time;

                        brickActor.initializeForPlay(brickPosition, animationStartTime, animationDuration );
                        
                        if ( animationDuration>maxt ) {
                            maxt= animationDuration;
                        }
                    }
                }
            }
*/
            var radius= Math.max(this.director.width,this.director.height );
            var angle=  Math.PI*2*Math.random();
            var me=     this;

            var p0= Math.random()*this.director.width;
            var p1= Math.random()*this.director.height;
            var p2= Math.random()*this.director.width;
            var p3= Math.random()*this.director.height;


for( i=0; i<this.gameRows; i++ ) {
                for( j=0; j<this.gameColumns; j++ ) {
                    var brickActor= this.brickActors[i][j];

                    if ( brickActor.brick.removed ) {
                        brickActor.setOutOfFrameTime();
                    } else {

                        brickActor.
                                setFrameTime( this.directorScene.time, Number.MAX_VALUE ).
                                setAlpha(1).
                                enableEvents(true).
                                reset();

                        var random= (Math.random()*1000)>>0;

                        var brickPosition= this.getBrickPosition(i,j);
                        brickActor.pb.
                                emptyListenerList().
                                setPath(
                                    new CAAT.CurvePath().
                                            setCubic(
                                                radius/2 + Math.cos(angle)*radius,
                                                radius/2 + Math.sin(angle)*radius,
                                                p0, p1, p2, p3,
                                                brickPosition.x,
                                                brickPosition.y)
                                    ).
                                setInterpolator(
                                    new CAAT.Interpolator().createExponentialInOutInterpolator(3,false) ).
                                setFrameTime(this.directorScene.time, 1000+random);
                        brickActor.sb.
                                emptyListenerList().
                                setValues( .1, 1, .1 , 1).
                                setInterpolator(
                                    new CAAT.Interpolator().createExponentialInOutInterpolator(3,false) ).
                                setFrameTime(this.directorScene.time , 1000+random);


                        brickActor.
//                                emptyBehaviorList().
//                                addBehavior(moveB).
//                                addBehavior(sb).
                                enableEvents(false);


                        var actorCount=0;
                        brickActor.pb.addListener( {
                            behaviorExpired : function( behavior, time, actor ) {
                                actorCount++;
                                if ( actorCount==me.context.getLevelActiveBricks() ) {
                                    brickActor.pb.emptyListenerList();
                                    if ( me.context.status==me.context.ST_INITIALIZING ) {
                                        me.context.setStatus( me.context.ST_RUNNNING );
                                    }
                                }
                            }
                        });
                    }
                }
            }


            context= this.context;
            this.directorScene.createTimer(
                this.directorScene.time,
                maxt,
                function timeout() {
                    if ( context.status==context.ST_INITIALIZING ) {
                        context.setStatus( context.ST_RUNNNING );
                    }
                }
            );

            this.actorInitializationCount=0;
        },
        contextEvent : function( event ) {

            var i, j;
            var brickActor;
            var me= this;

            if ( event.source=='context' ) {
                if ( event.event=='levelchange') {
                    this.bricksContainer.enableEvents(true);
                } else if ( event.event=='status') {
                    if ( event.params==this.context.ST_INITIALIZING ) {

                        this.director.audioPlay( 'mostrarpanel' );

                        this.initializeActors();
                    } else if ( event.params==this.context.ST_RUNNNING) {
                        for( i=0; i<this.gameRows; i++ ) {
                            for( j=0; j<this.gameColumns; j++ ) {
                                brickActor= this.brickActors[i][j].set();
                            }
                        }

                        this.cancelTimer();
                        this.enableTimer();

                    } else if ( event.params==this.context.ST_LEVEL_RESULT ) {
                        this.director.audioPlay('10');
                        this.cancelTimer();
                        var me= this;
                        // wait 1 sec
                        var timer= this.directorScene.createTimer(
                                this.directorScene.time,
                                1000,
                                function (sceneTime, time, timerTask) {
                                    me.endLevel();
                                },
                                null
                                );
                    } else if ( event.params==this.context.ST_ENDGAME ) {
                        this.director.audioPlay('01');
                        this.endGame();
                    }
                }
            } else if ( event.source==='brick' ) {
                if ( event.event==='selection' ) {   // des/marcar un elemento.
                    this.director.audioPlay( event.params.selected ? '11' : 'deseleccionar' );
                    this.brickSelectionEvent(event);
                } else if ( event.event==='selectionoverflow') {  // seleccion error.
                    this.director.audioPlay( 'sumamal' );
                    this.selectionOverflowEvent(event);
                } else if ( event.event==='selection-cleared') {
                    CAAT.setCursor('default');
                    this.director.audioPlay('12');
                    this.selectionClearedEvent(event);
                } else if ( event.event==='rearranged' ) {
                    this.rearrange( event );
                } else if ( event.event==='respawn' ) {
                    this.respawn(event);
                }

                // rebuild selection path
                this.selectionPath.setup(
                        this.context,
                        this.brickActors);
            }
        },
        respawn : function(event) {
            var respawnData= event.params;

            for( var i=0; i<respawnData.length; i++ ) {
                var row= respawnData[i].row;
                var col= respawnData[i].column;

                var brickPos= this.getBrickPosition(row,col);
                this.brickActors[row][col].respawn(brickPos.x, brickPos.y);
            }
        },
        rearrange : function(event) {

            var fromRow= event.params.fromRow;
            var toRow=   event.params.toRow;
            var column=  event.params.column;

            var tmp= this.brickActors[fromRow][column];
            this.brickActors[fromRow][column]= this.brickActors[toRow][column];
            this.brickActors[toRow][column]= tmp;

            // el actor de posicion row, column, no tiene que ser el que esperabamos
            // porque se ha reorganizado la cuadricula del modelo.
            var brickActor= this.brickActors[toRow][column];
            var brickPos= this.getBrickPosition(toRow,column);

            brickActor.rearrange( brickPos.x, brickPos.y );
        },
        brickSelectionEvent : function(event) {
            var me= this;
            var brick= event.params;
            var brickActor= this.brickActors[brick.row][brick.column];

            if ( brick.selected ) {

                if ( !HN.LOWQUALITY ) {
                    // dibujar un grupo de estrellas desde el centro del ladrillo haciendo fade-out.
                    var x0= brickActor.x+brickActor.width/2-this.starsImage.singleWidth/2;
                    var y0= brickActor.y+brickActor.height/2-this.starsImage.singleHeight/2;
                    var R= Math.sqrt( brickActor.width*brickActor.width + brickActor.height*brickActor.height )/2;
                    var N= 16;
                    var i;
                    var rad= Math.PI/N*2;
                    var T= 300;

                    for( i=0; i<N; i++ ) {
                        var x1= x0+ R*Math.cos( i*rad );
                        var y1= y0+ R*Math.sin( i*rad );

                        if ( this.selectionStarCache.length ) {
                            var actor= this.selectionStarCache.shift();
                            actor.setFrameTime(this.directorScene.time, T);
                            actor.backgroundImage.setAnimationImageIndex( [(Math.random()*6)>>0] );
                            actor.__trb.setFrameTime(this.directorScene.time, T);
                            actor.__trb.path.setInitialPosition(x0,y0).setFinalPosition(x1,y1);
                            actor.__ab.setFrameTime(this.directorScene.time, T);

                            actor.__parent.addChild(actor);
                        }
                    }
                }

                brickActor.setSelected();
            }
            else {
                brickActor.reset();
            }
        },
        selectionOverflowEvent : function(event) {
            var i,j;
            var selectedContextBricks= event.params;
            var actor;

            for( i=0; i<selectedContextBricks.length; i++ ) {
                this.brickActors[ selectedContextBricks[i].row ][ selectedContextBricks[i].column ].reset();
            }

            this.bricksContainer.enableEvents(false);

            // get all active actors on board
            var activeActors= [];
            for( i=0; i<this.gameRows; i++ ) {
                for( j=0; j<this.gameColumns; j++ ) {
                    actor= this.brickActors[i][j];
                    if ( !actor.brick.removed ) {
                        activeActors.push(actor);
                    }
                }
            }

            var me= this;

            // for each active actor, play a wrong-path.
            for( i=0; i<activeActors.length; i++ ) {
                activeActors[i].selectionOverflow();
            }

            var ttimer;
            ttimer= this.directorScene.createTimer(
                this.directorScene.time,
                HN.BrickActor.prototype.timeOverflow+100,
                function timeout(sceneTime, time, timerTask) {
                    me.bricksContainer.enableEvents(true);
                },
                function tick(sceneTime, time, timerTask) {
                });

        },
        selectionClearedEvent : function(event) {
            var selectedContextBricks= event.params;
            var i;

            for( i=0; i<selectedContextBricks.length; i++ ) {
                var actor= this.brickActors[ selectedContextBricks[i].row ][ selectedContextBricks[i].column ];
                actor.parent.setZOrder(actor,Number.MAX_VALUE);
                actor.selectionCleared(this, this.director.height);
            }

            this.timer.reset(this.directorScene.time);
        },
        showLevelInfo : function() {

        },
        prepareSceneIn : function(gameMode) {
            // setup de actores
            var i,j;

            this.gameMode= gameMode;

            this.bricksContainer.enableEvents(true);

            // fuera de pantalla
            for( i=0; i<this.gameRows; i++ ) {
                for( j=0; j<this.gameColumns; j++ ) {
                    this.brickActors[i][j].setLocation(-100,-100);
                }
            }

            this.selectionPath.initialize();

            this.chronoActor.tick(0,0);
            this.scoreActor.reset();

            this.endGameActor.setFrameTime(-1,0);
        },
        endGame : function() {
            this.fireEvent( 'end-game', {
                score: this.context.score,
                level: this.context.level,
                gameMode: this.context.gameMode.name
            })
//            this.gardenScene.scores.addScore( this.context.score, this.context.level, this.context.gameMode.name );
            this.showGameEvent( this.endGameActor );
        },
        addGameListener : function(gameListener) {
            this.gameListener.push(gameListener);
        },
        fireEvent : function( type, data ) {
            for( var i=0, l= this.gameListener.length; i<l; i++ ) {
                this.gameListener[i].gameEvent(type, data);
            }
        },
        setDifficulty : function(level) {
            this.context.difficulty=level;
        },
        cancelTimer : function(){
            if ( this.timer!=null ) {
                this.timer.cancel();
            }
            this.timer= null;
        },
        enableTimer : function() {
            var me= this;
            
            this.timer= this.directorScene.createTimer(
                this.directorScene.time,
                this.context.turnTime,
                function timeout(sceneTime, time, timerTask) {
                    me.context.timeUp();
                },
                function tick(sceneTime, time, timerTask) {
                    me.chronoActor.tick(time, timerTask.duration);
                });

        },
        setGameMode : function(gameMode) {
            this.context.setGameMode(gameMode);
        },
        endLevel : function() {
            var level= this.context.level;
            if ( level>7 ) {
                level=7;
            }
            var image= this.director.getImage( 'msg'+level);
            if ( null!=image ) {
                this.endLevelMessage.setBackgroundImage( image, true );
                this.endLevelMessage.setLocation(
                        (this.endLevelMessage.parent.width-image.width)/2,
                        this.endLevelMessage.parent.height/2 - 25
                        );
            }
            this.showGameEvent( this.endLevelActor );
        },
        removeGameEvent : function( actor, callback ) {
            actor.enableEvents(false);
            this.uninitializeActors();

            var me= this;

            actor.emptyBehaviorList();
            actor.addBehavior(
                new CAAT.PathBehavior().
                    setFrameTime( actor.time, 2000 ).
                    setPath(
                        new CAAT.LinearPath().
                                setInitialPosition( actor.x, actor.y ).
                                setFinalPosition( actor.x, -actor.height )
                    ).
                    setInterpolator(
                        new CAAT.Interpolator().createExponentialInInterpolator(2,false)
                    ).
                    addListener(
                        {
                            behaviorExpired : function(behavior, time, actor) {
                                actor.setOutOfFrameTime();
                                callback();
                            }
                        }
                    )
            );
        },
        showGameEvent : function(actor) {
            // parar y eliminar cronometro.
            this.cancelTimer();

            // quitar contorl de mouse.
            this.bricksContainer.enableEvents(false);

            // mostrar endgameactor.

            var x= (this.directorScene.width - actor.width)/2;
            var y= (this.directorScene.height - actor.height)/2 - 100;

            var me_endGameActor= actor;
            actor.emptyBehaviorList().
                setFrameTime(this.directorScene.time, Number.MAX_VALUE).
                enableEvents(false).
                addBehavior(
                    new CAAT.PathBehavior().
                        setFrameTime( this.directorScene.time, 2000 ).
                        setPath(
                            new CAAT.LinearPath().
                                setInitialPosition( x, this.directorScene.height ).
                                setFinalPosition( x, y ) ).
                        setInterpolator(
                            new CAAT.Interpolator().createExponentialInOutInterpolator(3,false) ).
                        addListener( {
                            behaviorExpired : function(behavior, time, actor) {
                                me_endGameActor.enableEvents(true);

                                me_endGameActor.emptyBehaviorList();
                                me_endGameActor.addBehavior(
                                        new CAAT.PathBehavior().
                                            setFrameTime( time, 3000 ).
                                            setPath(
                                                new CAAT.LinearPath().
                                                        setInitialPosition( me_endGameActor.x, me_endGameActor.y ).
                                                        setFinalPosition(
                                                            me_endGameActor.x+(Math.random()<.5?1:-1)*(5+5*Math.random()),
                                                            me_endGameActor.y+(Math.random()<.5?1:-1)*(5+5*Math.random()) )
                                            ).
                                            addListener( {
                                                behaviorExpired : function(behavior, time, actor) {
                                                    behavior.setFrameTime( time, 3000 );
                                                    behavior.path.setFinalPosition(
                                                            me_endGameActor.x+(Math.random()<.5?1:-1)*(5+5*Math.random()),
                                                            me_endGameActor.y+(Math.random()<.5?1:-1)*(5+5*Math.random())
                                                            );
                                                },
                                                behaviorApplied : function(behavior, time, normalizedTime, actor, value) {
                                                }
                                            }).
                                            setInterpolator(
                                                new CAAT.Interpolator().createExponentialInOutInterpolator(3,true)
                                                )
                                        );

                            },
                            behaviorApplied : function(behavior, time, normalizedTime, actor, value) {
                            }
                        } )
                );
        },
        soundControls : function(director) {
            var ci= new CAAT.SpriteImage().initialize( director.getImage('sound'), 2,3 );
            var dw= director.width;
            var dh= director.height;

            var music= new CAAT.Actor().
                    setAsButton( ci.getRef(),0,1,0,0, function(button) {
                        director.audioManager.setMusicEnabled( !director.audioManager.isMusicEnabled() );
                        if ( director.audioManager.isMusicEnabled() ) {
                            button.setButtonImageIndex(0,1,0,0);
                        } else {
                            button.setButtonImageIndex(2,2,2,2);
                        }
                    }).
                    setBounds( dw-ci.singleWidth-2, 2, ci.singleWidth, ci.singleHeight );

            var sound= new CAAT.Actor().
                    setAsButton( ci.getRef(),3,4,3,3, function(button) {
                        director.audioManager.setSoundEffectsEnabled( !director.audioManager.isSoundEffectsEnabled() );
                        if ( director.audioManager.isSoundEffectsEnabled() ) {
                            button.setButtonImageIndex(3,4,3,3);
                        } else {
                            button.setButtonImageIndex(5,5,5,5);
                        }
                    });
            if ( director.width>director.height ) {
                sound.setBounds( dw-ci.singleWidth-2, 2+2+ci.singleHeight, ci.singleWidth, ci.singleHeight );
            } else {
                sound.setBounds( dw-ci.singleWidth*2-2, 2+2, ci.singleWidth, ci.singleHeight );
            }

            music.prepare= function() {
                if ( director.audioManager.isMusicEnabled() ) {
                    this.setButtonImageIndex(0,1,0,0);
                } else {
                    this.setButtonImageIndex(2,2,2,2);
                }
            }

            sound.prepare= function() {
                if ( director.audioManager.isSoundEffectsEnabled() ) {
                    this.setButtonImageIndex(3,4,3,3);
                } else {
                    this.setButtonImageIndex(5,5,5,5);
                }
            }

            this.directorScene.addChild(sound);
            this.directorScene.addChild(music);

            this.music= music;
            this.sound= sound;
        },
        prepareSound : function() {
            try {
                this.sound.prepare();
                this.music.prepare();
            }
            catch(e) {

            }
        }

    };
})();

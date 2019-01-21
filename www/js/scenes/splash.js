class Splash {
    constructor(app) {

    this.splashText = new PIXI.Text('WILL', {
        align: 'center',
        fill: 'rgba(255, 255, 255, .9)',
        fontSize: 30,
        fontWeight: 100,
        fontFamily: 'FuturaICG, Roboto, Tahoma, Geneva, sans-serif',
        letterSpacing: 100
        });

    this.startText = new PIXI.Text('- start - ', {
        align: 'center',
        fill: 'rgba(255, 255, 255, .9)',
        fontSize: 20,
        fontWeight: 100,
        fontFamily: 'FuturaICG, Roboto, Tahoma, Geneva, sans-serif',
        letterSpacing: 5
        });


    this.setPosition(app.screen.width, app.screen.height);

    app.stage.addChild(this.splashText);
    app.stage.addChild(this.startText);

    this.startText.interactive = true;
    }

    setPosition(width,height) {
        this.splashText.x = width / 2 - this.splashText.width /2;
        this.splashText.y = height / 2;
    
        this.startText.x = width / 2 - this.startText.width/2;
        this.startText.y = height / 2 + 100;

    }

    showScene() {
            this.splashText.alpha = 0.7;
            this.startText.alpha = 0.7;
    }

    hideScene () {
        this.splashText.alpha = 0;
        this.startText.alpha = 0;
    }

    removeScene(app) {
        app.stage.removeChild(this.splashText);
        app.stage.removeChild(this.startText);
    }
}
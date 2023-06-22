
// configuration de l'application qu'on stock dans une variable
// les accolade c'est pour creer un objet : format JSON !!
// on peut y mettre des tonnes de donnees dans JSON(format d'echange de données)
// JSON = format de stockage de données (pas prevu pour ca a la base)
let config = {
    type: Phaser.AUTO,
    width: 611, // en pixels
    height: 980,
    physics: {
        default: 'arcade' //detecter les positions
    },
    scene: { //differents etats (gauche: nom de l'etat; droite: nom de la fontion qu'on va creer)
        preload : preload,     
        create: create,     
        update : update   
    }
};

//variables globales
let game = new Phaser.Game(config);
let inc = -0.015;
let snowFlakes;
let timer_snowflakes;
let christmasMusic;
let button;

// les differents etats de notre programme (fonctions: init, preload, create, update, update, update,update... etc)

function preload() {
    //on assigne notre image a un alias (background)
    this.load.image('background', './assets/images/back_2.png'); // "." fait ref au repertoire courants (chemin relatif)
    // l'image ne s'affiche pas encore
    this.load.image('tree', './assets/images/tree_1.png')
    this.load.image('ribbon', './assets/images/ribbon.png')
    this.load.image('ribbonClear', './assets/images/ribbonClear.png')
    this.load.image('ball1', './assets/images/obj/obj_23.png')
    this.load.image('candy', './assets/images/obj/obj_24.png')
    this.load.image('yellow', './assets/images/obj/obj_21.png')
    this.load.image('nounours', './assets/images/obj/obj_05.png')
    this.load.image('star', './assets/images/obj/star.png')
    this.load.image('blinking_star', './assets/images/obj/star.png')
    this.load.image('snowFlake', './assets/images/snowflake.png')
    this.load.image('snowButton', './assets/images/obj/obj_10.png')
    this.load.image('cloches', './assets/images/obj/obj_02.png')
    this.load.image('gift', './assets/images/obj/obj_15.png')
    this.load.image('button', './assets/images/button.png')
    
    this.load.audio('christmasMusic','./assets/audio/christmasMusic.mp3')
}

function create() {
    //add.image a trois characters (position x, position y, alias) - 0,0 est en haut a gauche
    backImage = this.add.image(0,0,'background')
    backImage.setOrigin(0,0); // en % par rapport à l'image (default 0.5,0.5)
    // c'est mieux d'avoir les images directement de la meme taille (gagne du temps, prechargement)
    backImage.setScale(0.5);  
    
    //quand on met rien devant, ca met var devant donc global donc pas top, on prefere des variables globales
    blinkingstar = this.add.image(100,100,'blinking_star');
    blinkingstar.alpha = 1;
    
    
    for(let i = 0; i < 30 ; i++) {
        star = this.add.image(Phaser.Math.Between(3, config.width),Phaser.Math.Between(0, config.height / 2),'star'); 
        //le random fonctionne avec des entiers donc faut diviser par 10 pour avoir des chiffre à vigule
        star.setScale(Phaser.Math.Between(3, 10)/10);    
        // il existe un methode pour les chiffre à virgules (float.Between)   
    }
    
    tree = this.add.image(150,750,'tree')
    tree.setScale(0.2);

    ribbon = this.add.image(145,750,'ribbon')
    ribbon.setScale(0.2);
    
    ribbonClear = this.add.image(145,750,'ribbonClear')
    ribbonClear.setScale(0.2);

    let tweenRibbon = this.tweens.add({
        targets: ribbonClear,
        alpha: 0,
        duration: 2000,
        ease: 'Power2',
        yoyo: true,
        loop: -1
        });

    ball1 = this.add.image(140,785,'ball1')
    ball1.setScale(0.15);

    yellow = this.add.image(170,720,'yellow')
    yellow.setScale(0.15);

    candy = this.add.image(160,850,'candy')
    candy.setScale(0.2);

    nounours = this.add.image(80,850,'nounours')
    nounours.setScale(0.5);

    let snowButton = this.add.image(config.width-220,100,'snowButton').setInteractive();
    snowButton.setScale(0.6);
    snowButton.on('pointerdown',snowControl)

    let cloches = this.add.image(config.width-100,100,'cloches').setInteractive();
    cloches.setScale(0.6);
    cloches.on('pointerdown',soundControl)

    let gift = this.add.image(config.width-160,config.height -160,'gift').setInteractive();
    gift.setScale(0.9);
    gift.on('pointerdown',popMessage);

    snowFlakes = this.physics.add.group({ //physics pour les faire se comporter comme des objects physiques (ils se superposent plus)
        defaultKey: 'snowFlake',
        maxSize: 20
    })
    
    timer_snowflakes = this.time.addEvent({
        delay: 1000,
        callback: spawnSnowflake,
        callbackScope : this,
        repeat : -1 // a 'l'infinis 
    })

    // bouton qui pop
    button = this.add.image(config.width/2,config.height/3,'button');
    button.setVisible(false);
    
    christmasMusic = this.sound.add('christmasMusic');
}

// mise a jour de la frame (donc ca doit etre rapide)
// quand on a trop de trucs dans l'update, on passe à moins de FPS (drop de framerate donc lag)
// on ne sait pas dans quelle machine ca va etre jouer donc il faut optimier pour les machines pas top

function update() {

    // changer l'alpha d'une etoile pour qu'elle clignotte
    // alpha: de 0 à 1, puis de 1 à 0
    // probleme de logique dear
    if (blinkingstar.alpha == 1) inc = -inc;
    if (blinkingstar.alpha < 0.3) {
        inc = -inc;
        blinkingstar.setPosition(Phaser.Math.Between(3, config.width),Phaser.Math.Between(0, config.height / 2))
    }
    blinkingstar.alpha += inc

    //des que tu depasses en dessous, tu vas retourner dans le panier
    snowFlakes.getChildren().forEach(
        function(snowFlake) {
        if (snowFlake.y > 980) snowFlake.destroy(); //destroy est pas un super non car il n'est pas detruit, il le prend et le remet dans le groupe 
        }, this); //this fait ref a config of course
}

function spawnSnowflake () {
    snowFlake = snowFlakes.get();
    //si snowflake existe (si jen ai pas, il se passe rien)
    if (snowFlake){
        snowFlake.setPosition(Phaser.Math.Between(0,config.width), 0);
        snowFlake.setVelocity(0,50);
    }
}

function snowControl() {
    //si le timer est lancé:
    timer_snowflakes = ! timer_snowflakes;
}

function soundControl() {
    //si le timer est lancé:
    christmasMusic.play();
}

function popMessage(){
    button.setVisible(false) = ! button.setVisible(true);
}
   
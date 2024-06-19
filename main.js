
let msPrev = window.performance.now();
let fps = 60;
const msPerFrame = 1000/fps;

const GRAVITY = 1;

class Game {
    
    sceneID = 0;
    canvas = document.getElementById("mainCanvas");
    ctx = this.canvas.getContext('2d');
    init = () => {
        
        this.mainEvent=this.assignMainEvent(()=>{});
        
        this.audioController = new Audio();
        
        this.audioController.volume=0.3;
        
        this.levelMusic = new Audio();
        this.score =0;
        this.deaths=0;
        
        this.objects = [];
        
        this.UIElements = []
        
        this.LevelUIElements = [];
        this.loadAudio();
        
        this.level = LOAD_LEVEL(this,this.sceneID);
        
        this.launchEvent = ()=>{this.playLevelAudio(this.level.ost);this.canvas.removeEventListener('mousedown',this.launchEvent)};
        this.canvas.addEventListener('mousedown',this.launchEvent);
        
        
        this.assignEventsListeners();
        
        this.playerTemplate = {name:"Player",x:this.level.playerStartPos.x,y:this.level.playerStartPos.y,src:'player_sheet.png',w:50};
        
        this.actualCharacter = this.createNewPlayer();
        
        this.background = new Image();
        this.background.src=this.level.bg;
        this.objects.push(...this.level.objects);
        this.loadLevelUI();
        this.LevelUIElements.push(...this.level.UI);
        this.level.onLoad();
        requestAnimationFrame(this.Update)        
    }

    
    resetLevel = () =>{
        this.assignMainEvent(()=>{});
        this.audioController = new Audio();
        this.audioController.volume=0.3;
        this.levelMusic = new Audio();
        this.score =0;
        this.deaths=0;
        this.objects = [];
        this.UIElements = []
        this.LevelUIElements = [];
        this.loadAudio();
        this.level = LOAD_LEVEL(this,this.sceneID);
        this.playLevelAudio(this.level.ost);
        this.assignEventsListeners();
        this.playerTemplate = {name:"Player",x:this.level.playerStartPos.x,y:this.level.playerStartPos.y,src:'player_sheet.png',w:50};
        this.actualCharacter = this.createNewPlayer();
        this.background = new Image();
        this.background.src=this.level.bg;
        this.objects.push(...this.level.objects);
        this.loadLevelUI();
        this.LevelUIElements.push(...this.level.UI);
        this.level.onLoad();
        requestAnimationFrame(this.Update);
    }

    loadLevelUI = () =>{
        this.UIDeathText = new UIText('deathCounter',this.canvas.width/2,50,this.deaths.toString(),50,'white');
        this.UIDeathLabel = new UIImage('skull',this.UIDeathText.x-60,this.UIDeathText.y-40,'skull.png',50,50);
        this.UIElements.push(this.UIDeathLabel);
        this.UIElements.push(this.UIDeathText);
    }

    loadAudio = () =>{
        this.jumpSound = new Audio();
        this.jumpSound.src = 'sounds/jump.wav';
        this.jumpSound.volume=0.3;
        this.deathSound = new Audio();
        this.deathSound.src = 'sounds/death.wav';
    }

    assignMainEvent = (func)=>{
        document.removeEventListener('keydown',this.mainEvent);
        this.mainEvent=func;
        document.addEventListener('keydown',this.mainEvent);
    }

    changeAudio = (src)=>{
        this.audioController.pause();
        this.audioController.src=`sounds/${src}`;
    }
    playAudio = ()=>{
        this.audioController.play();
    }
    
    playAudioClip = (src)=>{
        this.setAudioClip(this.audioController,src);
        this.playAudio();
    }
    
    setAudioClip = (audio,src)=>{
        audio.src=`sounds/${src}`;
    }
    
    playLevelAudio = (src)=>{
        this.levelMusic.pause()
        this.setAudioClip(this.levelMusic,src);
        this.levelMusic.loop=true;
        this.levelMusic.volume=0.5;
        this.levelMusic.play();
    }
    
    changeScene = (id) =>{
        this.sceneID=id;
    }
    
    loadNewScene = (id)=>{
        this.audioController.pause();
        document.removeEventListener('keydown',this.mainEvent);
        this.levelMusic.pause();
        this.changeScene(id);
        this.resetLevel();
    }
   
    resetCurrentScene = ()=>{
        if(!this.level.static){
        this.assignMainEvent(()=>{});
        this.score =0;
        this.deaths=0;
        this.objects = [];
        this.UIElements = []
        this.LevelUIElements = [];
        this.loadAudio();
        this.level = LOAD_LEVEL(this,this.sceneID);
        this.assignEventsListeners();
        this.playerTemplate = {name:"Player",x:this.level.playerStartPos.x,y:this.level.playerStartPos.y,src:'player_sheet.png',w:50};
        this.actualCharacter = this.createNewPlayer();
        this.background = new Image();
        this.background.src=this.level.bg;
        this.objects.push(...this.level.objects);
        this.loadLevelUI();
        this.LevelUIElements.push(...this.level.UI);
        this.level.onLoad();
        requestAnimationFrame(this.Update);
        }
    }
    
    keyDown = (e)=>{
        if (this.actualCharacter.isControllable) {
            if(e.repeat){return;}
            if(e.deafaultPrevented){return;}
            if(e.code=='ArrowLeft'){
                this.actualCharacter.velocity.x = -1;
                this.actualCharacter.setLeftSprite();
                this.actualCharacter.changeSpriteIDLeft();
            }
            if(e.code=='ArrowRight'){
                this.actualCharacter.velocity.x = 1;
                this.actualCharacter.changeSpriteIDRight();
            }
            if(e.code=='Space'||e.code=='ArrowUp'){
                if (this.actualCharacter.canJump) {
                    this.jumpSound.play();
                    this.actualCharacter.velocity.y = -this.actualCharacter.JUMP;
                    this.actualCharacter.canJump = false;
                    this.actualCharacter.onGround = false;
                }
            }
        }
    }
    
    keyUp = (e) => {
        if (this.actualCharacter.isControllable) {
            if (e.code == 'ArrowRight' || e.code == 'ArrowLeft') {
                this.actualCharacter.velocity.x = 0;
                this.actualCharacter.setSideSprite();
            }
        }
        if(!this.level.static){
            if(e.code=='KeyR'){
                this.resetCurrentScene();
            }
        }
    }
    
    assignEventsListeners = () =>{
        document.addEventListener('keydown',this.mainEvent);
        document.addEventListener('keydown', this.keyDown);
        document.addEventListener('keyup',this.keyUp);
        document.addEventListener('keyup', this.replace);
    }
    
    createNewPlayer = ()=>{
        return new Character(this.playerTemplate.name.toString(), this.level.playerStartPos.x, this.level.playerStartPos.y, this.playerTemplate.src,this.playerTemplate.w);
    }
   
    replace = (e) => {
        if (e.code == 'KeyC') {
            this.killActualCharacter();
        }
    }
   
    killActualCharacter = (leaveBody=true) =>{
        
            this.deathSound.play();
            
            document.removeEventListener('keydown', this.actualCharacter.keyDown);
            
            document.removeEventListener('keyup',this.actualCharacter.keyUp);
            
            this.actualCharacter.disableControls();
            
            this.deaths+=1;
            
            this.UIDeathText.setText(this.deaths.toString());
            if(!leaveBody){
                this.actualCharacter.setPosition(this.level.playerStartPos.x,this.level.playerStartPos.y);
            }
            
            this.actualCharacter.velocity.x=0;
            let actual = this.actualCharacter;
            
            let newPlayer = this.createNewPlayer();
            this.actualCharacter = newPlayer;
            if(leaveBody){
                this.objects.push(actual);
            }
            document.addEventListener('keydown', this.actualCharacter.keyDown);
            document.addEventListener('keyup',this.actualCharacter.keyUp);
    }
   
    Update = () => {
        requestAnimationFrame(this.Update);
        
        const msNow = window.performance.now();
        const msPassed=msNow-msPrev;
        if(msPassed<msPerFrame)return;
        const excessTime = msPassed % msPerFrame;
        msPrev = msNow-excessTime;
        
        this.clearCanvas();
        
        this.ctx.drawImage(this.background,0,0,this.canvas.width,this.canvas.height);
        
        if(!this.level.static){
            this.actualCharacter.drawObject(this.ctx);
            this.detectCollisions();
            this.drawUIElements();
        }
        this.drawObjects();
        this.drawLevelUIElements();
    }

    clearCanvas = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
   
    drawUIElements = () =>{
        this.UIElements.forEach(e=>{
            e.drawObject(this.ctx);
        })
    }
   
    drawLevelUIElements = () =>{
        this.LevelUIElements.forEach(e=>{
            e.drawObject(this.ctx);
        })
    }
   
    drawObjects = () => {
        this.objects.forEach(e => {
            e.drawObject(this.ctx);
        });
    }
   
    detectCollisions = () =>{
        this.objects.forEach(e => {
            if(!(e instanceof Trigger)&&!(e instanceof TriggerRect)){
                this.actualCharacter.detectCollision(e);
            }
            else{
                    e.onTrigger(this.actualCharacter);
            }
            this.objects.forEach(obj=>{
                if(obj!=e){
                    if(obj instanceof Trigger || obj instanceof TriggerRect){
                        obj.onTrigger(e);
                        obj.onTrigger(this.actualCharacter);
                    }
                    else if(obj instanceof RigidBody){
                        obj.detectCollision(e);
                    }
                    else if(obj instanceof Character){
                        obj.detectCollision(e);
                    }
                }
            })
        });
    }

}

window.onload = () => {

    game.init();
}

let game = new Game();
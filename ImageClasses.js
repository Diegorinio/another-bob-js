

class GameObject {
    
    constructor(name, x = 0, y = 0) {
        this.name = name;
        this.x = x;
        this.y = y;
    }
    
    setName = (name) => {
        this.name = name;
    }
    
    getName = () => {
        return this.name;
    }
    
    setX = (x) => {
        this.x = x;
    }
    
    getX = () => {
        return this.x;
    }
    
    setY = (y) => {
        this.y = y;
    }
    
    getY = () => {
        return this.y;
    }

    
    setPosition = (x, y) => {
        this.setX(x);
        this.setY(y);
    }
    
    
    getPosition = () =>{
        return {x:this.getX(),y:this.getY()};
    }
}


class ImageObject extends GameObject {
    
    constructor(name, x = 0, y = 0, src = 'empty.png', width) {
        super(name, x, y);
        
        this.collidable = true;
        
        this.isVisible = true;
        
        this.sprite = new Image();

        
        if (src == '') {
            src = 'empty.png';
        }

        
        this.setSprite(src);
        
        this.sprite.onload = () => {
            
            this.width = width || this.sprite.width;
            
            this.height = this.sprite.height;
        };
        this.height = this.sprite.height;
        if(width==0){
            this.width=this.sprite.width;
        }
        else{
            this.width=width;
        }
    }
    
    changeVisibility = (state) => {
        this.isVisible = state;
    }

    
    setCollidable = (state) => {
        this.collidable = state;
    }

    
    
    disableObject = () => {
        this.isVisible = false
        this.collidable = false;
    }
    
    
    enableObject = () => {
        this.isVisible = true;
        this.collidable = true;
    }

    
    setSprite = (src) => {
        this.sprite.src = `imgs/${src}`;
    }
    
    getSprite = () => {
        return this.sprite;
    }

    
    
    
    drawObject = (ctx) => {
        if (this.isVisible) {
            ctx.drawImage(this.getSprite(), this.getX(), this.getY());
        }
    }

    
    drawObjectSheetElement = (ctx, id) => {
        if (this.isVisible) {
            ctx.drawImage(this.getSprite(), id * this.width, 0, this.width, this.height, this.getX(), this.getY(), this.width, this.height);
        }
    }
}


class ConstObject extends ImageObject {
    
    constructor(name, x, y, src, dx, dy, visible = true) {
        super(name, x, y, src);
        
        this.dx = dx;
        
        this.dy = dy;
        this.sprite.onload = () => {
            this.width = this.dx;
            this.height = this.dy;
        };
        this.width = this.dx;
        this.height = this.dy;
        this.isVisible = visible;
    }

    
    setdX = (dx)=>{
        this.dx=dx;
        this.width=dx;
    }
    
    getdX = ()=>{
        return this.dx;
    }
    
    setdY = (dy)=>{
        this.dy=dy;
        this.height=dy;
    }
    
    getdY = () =>{
        return this.dy;
    }
    
    resizeObject = (dx,dy)=>{
        this.dx=dx;
        this.dy=dy;
        this.width=dx;
        this.height=dy;
    }

    
    drawObject = (ctx) => {
        if (this.isVisible) {
            ctx.drawImage(this.getSprite(), this.getX(), this.getY(), this.dx, this.dy);
        }
    }
}



class Trigger extends ImageObject {
    
    
    
    constructor(name, x = 0, y = 0, src = 'trigger.png', width = 0, onEnter, show = false, detectName = 'Player') {
        super(name, x, y, src,width);
        if (src == '') {
            src = 'trigger.png';
        }
        
        this.isTriggered = false;
        
        this.triggerEnter = onEnter;
        this.isVisible = show;
        
        this.detectName = detectName;
        
        this.triggerable=true;
    }

    
    setDetectName = (name) => {
        this.detectName = name;
    }
    
    getDetectName = () => {
        return this.detectName;
    }
    
    disableObject = () => {
        this.collidable = false;
        this.triggerable = false;
    }
    
    enableObject = () => {
        this.collidable = true;
        this.triggerable = true;
    }

    
    setOnTriggerEnterEvent = (func) => {
        this.triggerEnter = func;
    }

    
    onTrigger = (obj) => {
        
        if (this.triggerable) {
            
            if (!(obj instanceof ConstObject) || !(obj instanceof GameObjectRect)) {
                if (this.isInTrigger(obj)) {
                    this.triggerEnter();
                }
            }
        }
    }

    
    isInTrigger = (obj) => {
        if (obj.name == this.detectName) {
            return this.checkCollisionWith(obj);
        }
        else {
            return false;
        }
    }
    
    checkCollisionWith = (obj2) => {
        if (this.collidable) {
            const collisionX = this.x < obj2.x + obj2.width && this.x + this.width > obj2.x;
            const collisionY = this.y < obj2.y + obj2.height && this.y + this.height > obj2.y;
            return collisionX && collisionY;
        }
    }
}



class Item extends Trigger {
    constructor(name, x, y, src = 'trigger.png', width = 0, onEnter) {
        super(name, x, y, src, width, onEnter, () => { });
    }
    onTrigger = (obj) => {
        if (this.isInTrigger(obj)) {
            this.triggerEnter();
            this.isTriggered = true;
            this.isVisible = false;
            this.collidable = false;
            this.show = false;
        }
    }
}


class Character extends ImageObject {
    constructor(name, x = 0, y = 0, src = 'empty.png', width = 0) {
        super(name, x, y, src, width);
        
        this.speed = 9.5;
        
        this.isControllable = true;
        
        this.velocity = { x: 0, y: 0 };
        
        this.gravity = GRAVITY;
        
        this.JUMP = 18;
        
        this.canJump = false;
        
        this.onGround = false;
        
        this.spriteID = 0;
        
        this.frames = this.sprite.width / width;
        
        this.lFrames = 4;
        
        this.rFrames = 4;
    }

    setVelocity = (forceX,forceY)=>{
        this.velocity = {x:forceX,y:forceY};
    }

    setVelocityX = (x)=>{
        this.velocity.x=x;
    }
    setVelocityY = (y)=>{
        this.velocity.y=y;
    }
    getVelocity = ()=>{
        return this.velocity;
    }

    
    changeSpriteID = () => {
        this.spriteID += 1;
        if (this.spriteID >= this.frames) {
            this.spriteID = this.frames - 1;
        }
    }

    
    changeSpriteIDLeft = () => {
        this.spriteID += 1;
        if (this.spriteID >= this.frames - this.lFrames) {
            this.spriteID = this.frames;
        }
    }
    
    changeSpriteIDRight = () => {
        this.spriteID += 1;
        if (this.spriteID >= this.rFrames) {
            this.spriteID = 3;
        }
    }

    
    setLeftSprite = () => {
        this.spriteID = 5;
    }

    
    setSideSprite = () => {
        if (this.spriteID >= this.frames / 2) {
            this.spriteID = 4;
        }
        else {
            this.spriteID = 0;
        }
    }
    
    setDieFrame = () => {
        this.spriteID = this.frames - 4;
    }
    
    playDie = () => {
        this.spriteID += 1;
        if (this.spriteID >= this.frames) {
            this.spriteID = this.frames - 1;
            clearInterval(this.dieInteval);
        }
    }

    
    
    updatePosition = () => {
        let newX = this.x + this.velocity.x * this.speed;
        if (!this.checkSideCollisions(newX)) {
            this.x = newX;
        } else {
            this.velocity.x = 0;
        }

        if (!this.onGround) {
            this.velocity.y += this.gravity;
        }
        let newY = this.y + this.velocity.y;
        if (!this.checkTopBottomCollisions(newY)) {
            this.y = newY;
        } else {
            if (this.velocity.y > 0) {
                this.onGround = true;
                this.canJump = true;
            }
            this.velocity.y = 0;
        }
    }

    
    
    drawObject = (ctx) => {
        this.updatePosition();
        this.drawObjectSheetElement(ctx, this.spriteID);
    }

    
    
    disableControls = () => {
        this.setDieFrame();
        this.setName('PlayerCorpse');
        this.dieInteval = setInterval(this.playDie, 100);
        this.isControllable = false;
    }
   
    checkCollisionWith = (obj2) => {
        if (this.collidable) {
            const collisionX = this.x < obj2.x + obj2.width && this.x + this.width > obj2.x;
            const collisionY = this.y < obj2.y + obj2.height && this.y + this.height > obj2.y;
            return collisionX && collisionY;
        }
    }
   
    checkSideCollisions = (x) => {
        for (let obj of game.objects) {
            if (obj.collidable) {
                if (obj != this && !(obj instanceof Trigger) && !(obj instanceof TriggerRect) && this.checkSideCollider(obj, x)) {
                    return true;
                }
            }
        }
        return false;
    }
   
    checkTopBottomCollisions = (y) => {
        for (let obj of game.objects) {
            if (obj.collidable) {
                if (obj != this && !(obj instanceof Trigger) && !(obj instanceof TriggerRect) && this.checkTopBottomCollider(obj, y)) {
                    return true;
                }
            }
        }
        return false;
    }

    
    checkSideCollider = (obj, offsetX) => {
        const collisionX = offsetX < obj.x + obj.width && offsetX + this.width > obj.x;
        const collisionY = this.y < obj.y + obj.height && this.y + this.height > obj.y;
        return collisionX && collisionY;
    }
    
    checkTopBottomCollider = (obj, offsetY) => {
        const collisionX = this.x < obj.x + obj.width && this.x + this.width > obj.x;
        const collisionY = offsetY < obj.y + obj.height && offsetY + this.height > obj.y;
        return collisionX && collisionY;
    }

    
    
   
    detectCollision = (obj) => {
        if (obj.collidable) {
            if (this.checkCollisionWith(obj)) {
                this.velocity.y = 0;
                this.canJump = true;
                this.onGround = true;
            } else if (!this.checkTopBottomCollisions(this.y + 1)) {
                this.gravity = GRAVITY;
                this.canJump = false;
                this.onGround = false;
            }
        }
    }
}
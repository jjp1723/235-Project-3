// Ship Class displays the ship in the scene as a sprite
class Ship extends PIXI.Sprite
{
    constructor(x = 0, y = 0)
    {
        super(app.loader.resources["images/Defense-Drone.png"].texture);
        this.anchor.set(.5, .5); // Position, scaling, rotating ect are now from center of sprite
        this.scale.set(1.5);
        this.x = x;
        this.y = y;
    }
}



// Alien Class displays aliens in the scene as sprites, and they can be move in a predetermined vector
class Alien extends PIXI.Sprite
{
    constructor(spriteLocation="images/Alien-Crasher.png", scale=1, x=0, y=0,)
    {
		super(app.loader.resources[spriteLocation].texture);
        this.anchor.set(.5, .5); // Position, scaling, rotating ect are now from center of sprite
        this.scale.set(scale)
		this.x = x;
        this.y = y;
        
		// Variables
        this.fwd = getRandomUnitVector();
        if(this.fwd.y < 0)
        {
            this.fwd.y *= -1;
        }
        if(this.fwd.y <= 5)
        {
            this.fwd.y += 2;
        }
		this.speed = 50;
		this.isAlive = true;
	}
	
	// Abstract method - Declared, but no implementation
    activate(){}
	
	// Public methods to be called from main.js
    move(dt=1/60)
    {
		this.x += this.fwd.x * this.speed * dt;
		this.y += this.fwd.y * this.speed * dt;
	}
	
    reflectX(sceneWidth)
    {
		this.fwd.x *= -1;
	}
	
    reflectY(sceneHeight)
    {
		this.fwd.y *= -1;
	}
	
	// Protected Methods
    _wrapX(sceneWidth)
    {
        if(this.fwd.x < 0 && this.x < 0 - this.width/2)
        {
			this.x = sceneWidth + this.width/2;
		}
        if(this.fwd.x > 0 && this.x > sceneWidth + this.width/2)
        {
			this.x = 0 - this.width/2;
		}
	}
	
    _wrapY(sceneHeight)
    {
        if(this.fwd.y < 0 && this.y < 0 - this.height/2)
        {
			this.y = sceneHeight + this.height/2;
		}
        if(this.fwd.y > 0 && this.y > sceneHeight + this.height/2)
        {
			this.y = 0 - this.height/2;
		}
    }
    
    _chase(dt)
    {
        let t = this.target;
        let amt = 3.0 * dt;
        let newX = cosineInterpolate(this.x, t.x, amt);
        let newY = cosineInterpolate(this.y, t.y, amt);
        this.x = newX;
        this.y = newY;
    }
}



// Wrapping Aliens will wrap around the scene instead of bouce off the edges
class WrappingAlien extends Alien
{
    reflectX(sceneWidth)
    {
        this._wrapX(sceneWidth);
    }

    reflectY(sceneHeight)
    {
        this._wrapY(sceneHeight);
    }
}



// Seeking Aliens with chase the player
class SeekingAlien extends Alien
{
    activate(target)
    {
		this.target = target;
	}
	
    move(dt)
    {
		super._chase(dt);
	}		
}



// Powerups will bounce around the scene, and will have different effects
class PowerUp extends PIXI.Sprite
{
    constructor(spriteLocation="images/Health-Up.png", scale=1, x=0, y=0)
    {
		super(app.loader.resources[spriteLocation].texture);
        this.scale.set(scale)
		this.x = x;
		this.y = y;
        
		// Variables
		this.fwd = getRandomUnitVector();
		this.speed = 50;
		this.isAlive = true;
	}
	
	// Public methods to be called from main.js
    move(dt=1/60)
    {
		this.x += this.fwd.x * this.speed * dt;
		this.y += this.fwd.y * this.speed * dt;
	}
	
    reflectX(sceneWidth)
    {
		this.fwd.x *= -1;
	}
	
    reflectY(sceneHeight)
    {
		this.fwd.y *= -1;
	}
}



// Planet Class will display a planet sprite in the scene
class Planet extends PIXI.Sprite
{
    constructor(spriteLocation="images/Earth.png", x=0, y=0)
    {
		super(app.loader.resources[spriteLocation].texture);
        this.anchor.set(.5, .5); // Position, scaling, rotating ect are now from center of sprite
		this.x = x;
		this.y = y;
	}
}



// Bullets will be simple circles that will be fired from the ship
class Bullet extends PIXI.Graphics
{
    constructor(color = 0xFFFFFF, x = 0, y = 0)
    {
        super();
        this.beginFill(color);
        this.drawRect(-2, -3, 4, 6);
        this.endFill();
        this.x = x;
        this.y = y;

        // Variables
        this.fwd = {x:0, y:-1};
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt = 1/ 60)
    {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}
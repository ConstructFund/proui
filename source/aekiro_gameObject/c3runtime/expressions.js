"use strict";

{
    const C3 = self.C3;
    C3.Behaviors.aekiro_gameobject.Exps = {
        name(){ return this.name; },
        parent(){ return this.parentName; },
        asjson(){
            var t = this.getTemplate();  
            return  JSON.stringify(t);
        },
        globalX(){ return this.GetObjectInstance().GetWorldInfo().GetX_old();},
        globalY(){ return this.GetObjectInstance().GetWorldInfo().GetY_old();},
        globalAngle(){ return this.GetObjectInstance().GetWorldInfo().GetAngle_old();},

        localX(){ return this.wi.GetX(true);},
        localY(){ return this.wi.GetY(true);},
        localAngle(){ return this.wi.GetAngle(true);}
    };
}

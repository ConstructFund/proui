"use strict";

{
    const C3 = self.C3;
    C3.Behaviors.aekiro_gameobject.Cnds = {
        IsName(name){ return name == this.name; },
        IsParentName(name){return name == this.parentName; },
        //IsParentType(type){return BelongsToObjectClass(type) },
        OnCloned(){ return true; }
    };

}

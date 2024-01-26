"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_gridviewbind.Instance = class aekiro_bindInstance extends C3.SDKBehaviorInstanceBase
	{
		constructor(behInst, properties)
		{
			super(behInst);
			
			this.GetObjectInstance().GetUnsavedDataMap().aekiro_gridviewbind = this;
			
			//*********************************
			this.index = -1 ;
			this.key = "" ;
			this.gridView = null;
			this.value = 0;
		}
	
		setValue (value){
			//console.log("%cLABEL %d : Set value to %s","color:blue", this.inst.uid, value);		
			this.value = value;
			//this.Trigger(C3.Behaviors.aekiro_gridviewbind.Cnds.OnChanged); //maybe later
		}
		
		triggerOnGridViewRender(){
			this.Trigger(C3.Behaviors.aekiro_gridviewbind.Cnds.OnGridViewRender);
		}

		isObject (a) {
			return (!!a) && (a.constructor === Object);
		}
	
		Release()
		{
			super.Release();
		}
	
		SaveToJson()
		{
			return {
			};
		}
	
		LoadFromJson(o)
		{
		}
	};
}

"use strict";

{
	C3.Behaviors.MyCompany_MyBehavior.Instance = class MyBehaviorInstance extends C3.SDKBehaviorInstanceBase
	{
		constructor(behInst, properties)
		{
			super(behInst);
			
			this._myProperty = 0;
			
			if (properties)
			{
				this._myProperty = properties[0];
			}
			
			// Opt-in to getting calls to Tick()
			//this._StartTicking();
			var inst = this.GetObjectInstance();
			var wi = inst.GetWorldInfo();

			

			var SetX_old = wi.SetX;
			//this.inst.set_bbox_changed_old = this.inst.set_bbox_changed;
			wi.SetX = function(x){
				SetX_old.apply(this,arguments);
				console.log("az");
			};
			//console.log();
		}

		Release()
		{
			super.Release();
		}
		
		SaveToJson()
		{
			return {
				// data to store for savegames
			};
		}

		LoadFromJson(o)
		{
			// load state for savegames
		}
		
		_OnDown(a, b, c) 
		{
			console.log("_OnInputDown"+a+"***"+b+"***"+c);
		}
		
		_OnMove(x, y) 
		{
			//console.log("_OnMove"+x+"***"+y);

        }

        _OnUp() {
            console.log("_OnUp");
        }

        _OnMouseWheel(a) {
            this._triggerDir = 0 > a.deltaY ? 1 : 0;
            console.log(a);
            
        }
		/*
		Tick()
		{
			const dt = this._runtime.GetDt(this._inst);
			const wi = this._inst.GetWorldInfo();
			
			// ... code to run every tick for this behavior ...
		}
		*/
	};
}
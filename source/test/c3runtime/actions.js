"use strict";

{
	C3.Behaviors.MyCompany_MyBehavior.Acts =
	{
		Stop()
		{
			// placeholder
			var inst = this.GetObjectInstance();
			inst.GetUnsavedDataMap().az = 33;
			console.log(inst.GetUnsavedDataMap());
			
			//console.log(inst.SaveToJson());
			console.log(inst);
			console.log(inst.GetSdkInstance());
			console.log(inst.GetObjectClass());
			console.log(inst.GetPlugin());
			console.log(C3.Plugins.Sprite);


			//console.log(inst.GetPlugin()==C3.Plugins.Sprite);
			console.log(inst.GetPlugin().constructor==C3.Plugins.Sprite);
			

			//inst.GetSdkInstance().CallAction(inst.GetPlugin().constructor.Acts.SetAnimFrame,1);
		}
	};
}
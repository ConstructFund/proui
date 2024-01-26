"use strict";

{
	const C3 = self.C3;
	C3.Behaviors.aekiro_gridView.Acts = {
		SetDataByJsonString(data,root){
			try {
				data = JSON.parse(data);
				//console.log(this.value);
			} catch(e) {
				console.error("ProUI-GRIDVIEW: json parse error !");
				return;
			}
			
			if(root){
				data = data[root];
			}
			this.value = data;
			this.build();
		},
		
		SetDataByJsonObject(jsonObject, root){
			var data = jsonObject.GetFirstPicked().GetSdkInstance()._data;
			if(root){
				data = data[root];
			}

			this.value = data;
			this.build();
		},
		Clear(){
			this.clear();
		}
	};
	
}

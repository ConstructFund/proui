"use strict";

{

	const DOM_COMPONENT_ID = "aekiro_remoteSprite_dom";

	const HANDLER_CLASS = class MyDOMHandler extends DOMElementHandler
	{
		constructor(iRuntime)
		{
			super(iRuntime, DOM_COMPONENT_ID);
		}

		CreateElement(e)
		{
			this.image = new Image();
			this.image.style.visibility = "hidden";
			this.UpdateState(this.image, e);
			return this.image;
		}

		/*CreateElement(e)
		{
			const elem = new Image();
			elem.style.visibility = "hidden";
			this.UpdateState(elem, e);
			return elem;
		}*/

		UpdateState(elem, e)
		{
			elem.src = e["src"];
		}

	};
	
	RuntimeInterface.AddDOMHandlerClass(HANDLER_CLASS);
}
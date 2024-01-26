"use strict";
{
    const C3 = self.C3;
    const tempQuad = C3.New(C3.Quad);

    C3.Plugins.aekiro_remoteSprite.Instance = class RemoteSpriteInstance extends C3.SDKWorldInstanceBase
    {
        constructor(inst, properties)
        {
            super(inst);

            this.texture = null;
            this.isImageLoaded = false;
            this.newImageLoaded = false;
            this.image = new Image();
            
        }

        Release()
        {
            super.Release();
        }

        Draw(renderer) {
            //return;
			if(!this.isImageLoaded)return;
			
			if(this.newImageLoaded){
				if(this.texture)
				{
					renderer.DeleteTexture(this.texture);
				}
				this.texture = renderer.CreateDynamicTexture(this.image.width,this.image.height,{mipMap:false});
                this.newImageLoaded = false;
                renderer.UpdateTexture(this.image, this.texture, {});
			}
            
            renderer.SetTexture(this.texture);

            const wi = this.GetWorldInfo();
            const quad = wi.GetBoundingQuad();
            const rcTex = new C3.Rect(0,0,1,1);
            
            if (this._runtime.IsPixelRoundingEnabled())
            {
                const ox = Math.round(wi.GetX()) - wi.GetX();
                const oy = Math.round(wi.GetY()) - wi.GetY();
                tempQuad.copy(quad);
                tempQuad.offset(ox, oy);
                renderer.Quad3(tempQuad, rcTex);
            }
            else
            {
                renderer.Quad3(quad, rcTex);
            }
        }


        
        SaveToJson()
        {
            return {
                // data to be saved for savegames
            };
        }

        LoadFromJson(o)
        {
            // load state for savegames
        }

    };
}
"use strict";
{
    const C3 = self.C3;
    C3.Plugins.aekiro_remoteSprite.Acts = {
        async LoadFromURL(url,keepCurrentSize) {
            url = await this._runtime.GetAssetManager().GetProjectFileUrl(url);
            this.image.src = url;

            this.image.onload = () =>{
                if(!keepCurrentSize){
                    const wi = this.GetWorldInfo();
                    wi.SetWidth(this.image.width,true);
                    wi.SetHeight(this.image.height,true);
                    wi.SetBboxChanged();
                }
                this.isImageLoaded = true;
                this.newImageLoaded = true;
                this._runtime.UpdateRender();
            };
        },

        SetEffect(a){
            this.GetWorldInfo().SetBlendMode(a);
            this._runtime.UpdateRender();
        }
    };
}
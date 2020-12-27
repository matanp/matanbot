require('dotenv').config();
const OBSWebSocket = require('obs-websocket-js');

const obs = new OBSWebSocket();

const port = process.env.OBS_PORT || 'localhost:4444';
const pw = process.env.OBS_PW;

async function getScenes() {
    try {
        let scene_data = await obs.send('GetSceneList');
        console.log(scene_data.scenes);
        scene_data.scenes.forEach(scene => {
            console.log(`Scene: ${scene.name}`);
            scene.sources.forEach(source => {
                console.log(source);
            });
            process.exit();
        });
    } catch (err) {
        console.log(err);
        throw(err);
    }
}

async function connect() {
    try {
        await obs.connect({address : port, password: pw});
        console.log('connected to obs websocket');
        //getScenes();
    } catch (err) {
        console.log('failed to connect to obs websocket');
        console.log(err);
        //throw(err);
    }
}

//will look for an image named image_name in the 'green screen effects'
//scene of OBS
//then will reorder the sources such that the image is
//right after the camera, in this case 'green screen - pre'
const switchGreenScreenBG = async (image_name) => {
    try {
        let scene_data = await obs.send('GetSceneList');
        let green_screen_scene = scene_data.scenes.find(scene => {
            return scene.name === 'green screen effects';
        });  
        if (scene_data.currentScene != green_screen_scene.name) {
            return false;
        }
        let image = green_screen_scene.sources.find(source => {
            return source.name === image_name;
        });
        
        let camera_order = green_screen_scene.sources.findIndex(source => {
            return source.name === 'green screen - pre';
        });
        //console.log(camera_order);

        re_ordered_sources = [];

        //keep camera and layers above in place
        for (i = 0; i <= camera_order; i++) {
            re_ordered_sources.push({"name":green_screen_scene.sources[i].name});
        }
        //image we want is right below camera
        re_ordered_sources.push({"name":image.name});
        
        //keep the rest of the order, don't include image twice
        for (i = camera_order+1; i < green_screen_scene.sources.length; i++) {
            if (green_screen_scene.sources[i] != image) {
                re_ordered_sources.push({"name": green_screen_scene.sources[i].name});
            }
        }

        //console.log(re_ordered_sources);
        await obs.send('ReorderSceneItems', {
            "scene": green_screen_scene,
            "items": re_ordered_sources       
        });    
        return true;
    } catch (err) {
        console.log(err);
        throw(err);
    }
}


//connect();
//setTimeout(function () { switchGreenScreenBG('duck');}, 100);

//setTimeout(function () { switchGreenScreenBG('earth stock');}, 2000);

module.exports = { switchGreenScreenBG: switchGreenScreenBG, connect: connect }

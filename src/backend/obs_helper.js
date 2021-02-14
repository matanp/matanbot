require("dotenv").config();
const OBSWebSocket = require("obs-websocket-js");
const consts = require("./consts.js");

const obs = new OBSWebSocket();

const port = process.env.OBS_PORT;
const pw = process.env.OBS_PW;

let current_scene; //keep current with OBS by listening to 'SwitchScenes' event
obs.on("SwitchScenes", (data) => {
    current_scene = data.sceneName;
});

async function getScene(scene_name) {
    let scene_data = await obs.send("GetSceneList");
    return scene_data.scenes.find((scene) => {
        return scene.name === scene_name;
    });
}

async function connect() {
    try {
        await obs.connect({ address: port, password: pw });
        console.log("connected to obs websocket");
        current_scene = (await obs.send("GetCurrentScene")).name;
    } catch (err) {
        console.log("failed to connect to obs websocket");
        console.log("OBS may not be open.");
        console.log(err);
    }
}

/*
will look for an image named image_name in the 'green screen effects'
scene of OBS
then will reorder the sources such that the image is
right after the camera, in this case 'green screen - pre'
*/
const switchGreenScreenBG = async (image_name) => {
    try {
        let green_screen_scene = await getScene(consts.green_screen_scene);
        if (current_scene != green_screen_scene.name) {
            return false;
        }
        let image = green_screen_scene.sources.find((source) => {
            return source.name === image_name;
        });

        let camera_order = green_screen_scene.sources.findIndex((source) => {
            return source.name === consts.green_screen_camera;
        });

        re_ordered_sources = [];

        //keep camera and layers above in place
        for (i = 0; i <= camera_order; i++) {
            re_ordered_sources.push({
                name: green_screen_scene.sources[i].name,
            });
        }
        //image we want is right below camera
        re_ordered_sources.push({ name: image.name });

        //keep the rest of the order, don't include image twice
        for (i = camera_order + 1; i < green_screen_scene.sources.length; i++) {
            if (green_screen_scene.sources[i] != image) {
                re_ordered_sources.push({
                    name: green_screen_scene.sources[i].name,
                });
            }
        }

        await obs.send("ReorderSceneItems", {
            scene: green_screen_scene,
            items: re_ordered_sources,
        });

        return true;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

/*
OBS scene 'hearts helper' has multiple copies of the same media source
when this method is called, show the first copy that is not
currently being shown.

video is loop of a heart eyes emoji, hence the naming
*/
const showHeartEyes = async () => {
    const heart_scene = await getScene(consts.hearts_scene);

    for (let source of heart_scene.sources) {
        if (!source.render) {
            //render source
            try {
                await obs.send("SetSceneItemRender", {
                    "scene-name": consts.hearts_scene,
                    source: source.name,
                    render: true,
                });
                //4.5 seconds later (length of video clip), unrender
                setTimeout(async () => {
                    await obs.send("SetSceneItemRender", {
                        "scene-name": consts.hearts_scene,
                        source: source.name,
                        render: false,
                    });
                }, 4500);
            } catch (err) {
                console.log(err);
            }
            break; //only render one source per call
        }
    }
};

module.exports = {
    switchGreenScreenBG: switchGreenScreenBG,
    connect: connect,
    showHeartEyes: showHeartEyes,
};

import { Media } from "../../types/dbTypes.ts";
import { useContext } from "react";
import { Box, Flex, Grid, Radio, RadioGroup } from "@chakra-ui/react";
import Carousel from "../../components/Carousel/Carousel.tsx";
import { GalleryRightCol } from "./GalleryRightCol.tsx";
import MediaPreview from "../../components/MediaPreview.tsx";
import { mediaTable } from "../../db-tables/WorkspaceDB.ts";
import { GalleryContext } from "../GalleryContext.ts";

interface MetaDataInfoProps {
  mediaList: Media[];
}
const GALLERY_IMAGE_SIZE = 120;
export function GalleryCarouselImageViewer({ mediaList }: MetaDataInfoProps) {
  const { curMedia, setCurMedia, diffMode, setDiffImgSrc, diffImgSrc } = useContext(GalleryContext);

  return (
    <Flex gap={3} h={"100%"}>
      <Grid
        gridTemplateRows={mediaList.length <= 6 ? "1fr 20%" : "1fr"}
        flex={1}
        gap={2}
      >
        <div style={{ height: "56vh" }}>
          <Carousel
            media={mediaList.map((v) => ({
              id: v.id,
              imageUrl: `/workspace/view_media?filename=${v.localPath}`,
            }))}
            currentNum={mediaList?.findIndex((p) => p.id === curMedia?.id) ?? 0}
            setMediaAct={(newMedia) =>
              setCurMedia(mediaList?.find((v) => v.id === newMedia.id) ?? null)
            }
          />
        </div>
        <Flex wrap={"wrap"}>
          <RadioGroup onChange={setDiffImgSrc} value={diffImgSrc}>
            {mediaList?.map((media) => (
              <Box
                display={"inline-block"}
                style={{
                  position: 'relative'
                }}
                p={1}
                borderRadius={"4px"}
                key={`image-bottom-${media.id}`}
                width={`${GALLERY_IMAGE_SIZE + 3}px`}
                height={`${GALLERY_IMAGE_SIZE + 3}px`}
                cursor={"pointer"}
                border={curMedia?.id === media.id ? "1px solid gray" : ""}
                onClick={() => setCurMedia(media)}
              >
                {diffMode === 'select' ? <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    right: '10px',
                    top: '10px',
                  }}><Radio colorScheme='red' size={'lg'} value={media.localPath} isDisabled={curMedia?.localPath === media.localPath} /></div> : null}
                <MediaPreview
                  mediaLocalPath={media.localPath}
                  size={GALLERY_IMAGE_SIZE}
                  objectFit="contain"
                  hideBrokenImage
                  onBrokenLink={() => {
                    mediaTable?.delete(media.id);
                  }}
                />
              </Box>
            ))}
          </RadioGroup>
        </Flex>
      </Grid>
      <GalleryRightCol media={curMedia ?? undefined} />
    </Flex>
  );
}

import { Button, Box, Flex } from "@chakra-ui/react";
import { useMemo } from "react";
import { useInfiniteQuery } from "react-query";

import { Header } from "../components/Header";
import { CardList } from "../components/CardList";
import { api } from "../services/api";
import { Loading } from "../components/Loading";
import { Error } from "../components/Error";

interface Image {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

interface GetImagesResponse {
  after: string;
  data: Image[];
}

export default function Home(): JSX.Element {
  async function fetchImages({ pageParam = null }): Promise<GetImagesResponse> {
    const { data } = await api("/images", {
      params: {
        after: pageParam,
      },
    });
    return data;
  }

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery("images", fetchImages, {
    getNextPageParam: (lastPage) => lastPage?.after || null,
  });

  const formattedData = useMemo(() => {
    return data?.pages.flatMap((image) => {
      return image.data.flat();
    });
  }, [data]);

  if (isLoading && !isError) {
    return <Loading />;
  }

  if (!isLoading && isError) {
    return <Error />;
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />

        {hasNextPage && (
          <Flex
            w="100%"
            align="center"
            justify="center"
            as="header"
            maxWidth={1120}
            h="20"
            mx="auto"
            mt="4"
            px="6"
          >
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
            </Button>
          </Flex>
        )}
      </Box>
    </>
  );
}

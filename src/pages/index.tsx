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
    const { data } = await api.get<GetImagesResponse>("/api/images", {
      params: {
        after: pageParam,
      },
    });
    console.log(data);
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
          <Button
            mt={3}
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
          </Button>
        )}
      </Box>
    </>
  );
}

export function meta() {
  return [
    { title: 'Artifex Labs website' },
    {
      name: 'description',
      content:
        'The official website of Artifex Labs, a passionate development team building open-source software on the Cardano blockchain.',
    },
    {
      tagName: 'link',
      rel: 'canonical',
      href: 'https://artifex.finance/',
    },
  ]
}

export default function Home() {
  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full pt-8 px-4 md:px-8">
      <h1 className="text-5xl font-bold text-center">Artifex Labs</h1>
      <h2 className="text-3xl">
        Website still under construction. In the meantime, check out{' '}
        <a href="https://djed.artifex.finance/" className=" text-blue-500">
          Reverse DJED
        </a>{' '}
        here.
      </h2>
    </div>
  )
}

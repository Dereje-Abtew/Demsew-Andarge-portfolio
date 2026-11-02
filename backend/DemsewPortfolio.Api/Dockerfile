FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["DemsewPortfolio.Api.csproj", "./"]
RUN dotnet restore "DemsewPortfolio.Api.csproj"
COPY . .
RUN dotnet publish "DemsewPortfolio.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "DemsewPortfolio.Api.dll"]
